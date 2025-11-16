import ClassMember from '../models/ClassMember.js';
import Exam from '../models/Exam.js';
import ExamSubmission from '../models/ExamSubmission.js';
import logger from '../libs/logger.js';

// --- CREATE EXAM ---
export const createExam = async (req, res) => {
    try {
        const { userId, body } = req;
        const { title, time, description, classId, questions, score } = body;

        if (!title || !time || !questions || !Array.isArray(questions)) {
            return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
        }

        // Kiểm tra quyền tạo bài cho lớp
        if (classId) {
            const leader = await ClassMember.findOne({ classId, userId, role: "leader" });
            if (!leader) return res.status(403).json({ message: 'Bạn không có quyền tạo bài thi cho lớp này' });
        }

        // Xác định xem exam có các type nào
        const hasType = {
            multichoices: false,
            truefalse: false,
            shortanswer: false
        };

        // Validate từng câu
        for (const [i, q] of questions.entries()) {
            if (!q.type) return res.status(400).json({ message: `Câu hỏi ${i + 1} thiếu type` });
            if (!['multichoices', 'true-false', 'short-answer'].includes(q.type)) {
                return res.status(400).json({ message: `Câu hỏi ${i + 1} có type không hợp lệ` });
            }

            if (q.type === 'multichoices') {
                hasType.multichoices = true;
                if (!q.multichoices || !q.multichoices.content || !Array.isArray(q.multichoices.options) || q.multichoices.options.length < 2) {
                    return res.status(400).json({ message: `Câu hỏi ${i + 1}: Trắc nghiệm không hợp lệ` });
                }
                if (typeof q.multichoices.correctAnswer !== 'number' || q.multichoices.correctAnswer < 0 || q.multichoices.correctAnswer >= q.multichoices.options.length) {
                    return res.status(400).json({ message: `Câu hỏi ${i + 1}: Đáp án đúng không hợp lệ` });
                }
            }

            if (q.type === 'true-false') {
                hasType.truefalse = true;
                if (!q.truefalse || !Array.isArray(q.truefalse.items) || q.truefalse.items.length === 0 || q.truefalse.items.length > 4) {
                    return res.status(400).json({ message: `Câu hỏi ${i + 1}: True/False không hợp lệ` });
                }
            }

            if (q.type === 'short-answer') {
                hasType.shortanswer = true;
                if (!q.shortanswer || !q.shortanswer.content || !q.shortanswer.correctAnswer) {
                    return res.status(400).json({ message: `Câu hỏi ${i + 1}: Short-answer không hợp lệ` });
                }
            }
        }

        // Validate score object theo type
        if (hasType.multichoices && (!score || typeof score.multichoices !== 'number' || score.multichoices <= 0)) {
            return res.status(400).json({ message: 'Score cho type multichoices là bắt buộc và phải > 0' });
        }
        if (hasType.truefalse && (!score || typeof score.truefalse !== 'number' || score.truefalse <= 0)) {
            return res.status(400).json({ message: 'Score cho type truefalse là bắt buộc và phải > 0' });
        }
        if (hasType.shortanswer && (!score || typeof score.shortanswer !== 'number' || score.shortanswer <= 0)) {
            return res.status(400).json({ message: 'Score cho type short-answer là bắt buộc và phải > 0' });
        }

        // Tạo exam
        const exam = new Exam({
            title,
            uploadBy: userId,
            time,
            description,
            classId: classId || null,
            questions,
            score // score theo type
        });

        await exam.save();
        return res.status(201).json({ message: 'Tạo bài thi thành công', exam });

    } catch (err) {
        logger('error', 'Lỗi khi tạo bài thi:', err);
        return res.status(500).json({ message: 'Lỗi máy chủ nội bộ', error: err.message });
    }
};


// --- SUBMIT EXAM ---

export const submitExam = async (req, res) => {
    try {
        const { userId, body } = req;
        const { examId, answers, startedAt, classId } = body;

        if (!examId) return res.status(400).json({ message: 'examId là bắt buộc' });
        if (!Array.isArray(answers)) {
            return res.status(400).json({ message: 'answers phải là mảng và không rỗng' });
        }

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ message: 'Exam không tồn tại' });

        let totalScore = 0;
        const tfScoreMap = { 0: 0, 1: 0.1, 2: 0.25, 3: 0.5, 4: 1 };

        const processedAnswers = [];

        for (let i = 0; i < answers.length; i++) {
            const ans = answers[i];
            const question = exam.questions.id(ans.questionId);

            if (!question) return res.status(400).json({ message: `Câu hỏi thứ ${i + 1} không tồn tại` });
            if (ans.type !== question.type) return res.status(400).json({ message: `Câu hỏi thứ ${i + 1} type không đúng` });

            const scoreType = {
                'multichoices': exam.score?.multichoices || 1,
                'true-false': exam.score?.truefalse || 1,
                'short-answer': exam.score?.shortanswer || 1
            }[ans.type];

            const processed = { questionId: ans.questionId, type: ans.type };

            // --- MULTICHOICE ---
            if (ans.type === 'multichoices') {
                if (typeof ans.multichoices !== 'number' || ans.multichoices < 0 || ans.multichoices >= question.multichoices.options.length) {
                    return res.status(400).json({ message: `Câu hỏi thứ ${i + 1}: đáp án trắc nghiệm không hợp lệ` });
                }
                processed.multichoices = {
                    selected: ans.multichoices,
                    correctAnswer: question.multichoices.correctAnswer
                };
                if (ans.multichoices === question.multichoices.correctAnswer) {
                    totalScore += scoreType;
                }
            }

            // --- TRUE/FALSE ---
            if (ans.type === 'true-false') {
                if (!Array.isArray(ans.truefalse) || ans.truefalse.length !== question.truefalse.items.length) {
                    return res.status(400).json({ message: `Câu hỏi thứ ${i + 1}: số lượng phát biểu không khớp` });
                }

                let correctCount = 0;
                const tfProcessed = [];

                for (let j = 0; j < ans.truefalse.length; j++) {
                    const itemAns = ans.truefalse[j];
                    const qItem = question.truefalse.items.id(itemAns.itemId);
                    if (!qItem) return res.status(400).json({ message: `Câu hỏi thứ ${i + 1}: item không tồn tại` });
                    if (typeof itemAns.answer !== 'boolean') {
                        return res.status(400).json({ message: `Câu hỏi thứ ${i + 1}: đáp án true/false không hợp lệ` });
                    }

                    const isCorrect = itemAns.answer === qItem.correctAnswer;
                    if (isCorrect) correctCount++;

                    tfProcessed.push({
                        itemId: itemAns.itemId,
                        answer: itemAns.answer,
                        correctAnswer: qItem.correctAnswer
                    });
                }

                processed.truefalse = tfProcessed;
                processed.result = tfProcessed.map(t => t.answer === t.correctAnswer);
                totalScore += tfScoreMap[Math.min(correctCount, 4)] * scoreType;
            }

            // --- SHORT ANSWER ---
            if (ans.type === 'short-answer') {
                if (!ans.shortanswer || typeof ans.shortanswer !== 'string') {
                    return res.status(400).json({ message: `Câu hỏi thứ ${i + 1}: đáp án tự luận không hợp lệ` });
                }
                processed.shortanswer = {
                    text: ans.shortanswer,
                    correctAnswer: question.shortanswer.correctAnswer
                };
                if (ans.shortanswer.trim().toLowerCase() === question.shortanswer.correctAnswer.trim().toLowerCase()) {
                    totalScore += scoreType;
                }
            }

            processedAnswers.push(processed);
        }

        const submission = new ExamSubmission({
            examId,
            userId,
            classId,
            answers: processedAnswers,
            score: totalScore,
            startedAt: startedAt || new Date(),
            completedAt: new Date()
        });

        await submission.save();

        return res.status(201).json({
            message: 'Nộp bài thành công',
            score: totalScore,
            submissionId: submission._id
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Lỗi máy chủ nội bộ', error: err.message });
    }
};


export const getExamInfo = async (req, res) => {
    try {
        const { id } = req.query;
        const exam = await Exam.findById(id).lean();
        if (!exam) {
            return res.status(409).json({
                message: 'De thi khong ton tai'
            })
        }
        const user = await ClassMember.findOne({
            userId: req.userId,
            classId: exam.classId
        });
        if (!user) {
            return res.status(402).json({
                message: 'KHong du quyen truy cap'
            })
        }
        return res.status(200).json(exam);
    } catch (error) {
        logger('error', 'Loi tai getExamInfo');
        return res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
}

export const getExamSubmissions = async (req, res) => {
    try {

        const { examId } = req.query;
        const exams = await ExamSubmission.find({ userId: req.userId, examId: examId });
        return res.status(200).json(exams);
    } catch (error) {
        logger('error', 'Loi tai getExamSubmissions');
        return res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
}

export const getClassSubmissions = async (req, res) => {
    try {

        const { classId } = req.query;
        const exams = await ExamSubmission.find({ userId: req.userId, classId: classId });
        return res.status(200).json(exams);
    } catch (error) {
        logger('error', 'Loi tai getClassSubmissions');
        return res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
}

export const getSubmission = async (req, res) => {
    try {

        const { id } = req.query;
        const exams = await ExamSubmission.findById(id);
        if (exams.userId != req.userId) return res.status(402).json({
            message: 'Khong du quyen truy cap'
        })
        return res.status(200).json(exams);
    } catch (error) {
        logger('error', 'Loi tai getSubmission');
        return res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
}