import mongoose, { Schema } from "mongoose";

const AnswerSchema = new Schema({
    questionId: { type: Schema.Types.ObjectId, required: true, ref: 'Exam.questions' },
    type: { type: String, required: true, enum: ['multichoices', 'true-false', 'short-answer'] },
    multichoices: { type: Number }, // index của đáp án chọn
    truefalse: [{ itemId: Schema.Types.ObjectId, answer: Boolean }], // lưu id của từng statement
    shortanswer: { type: String } // đáp án text
}, { _id: false });

const ExamSubmissionSchema = new Schema({
    examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [AnswerSchema],
    score: { type: Number, default: 0 },
    duration: { type: Number, default: 0 } // thời gian làm bài tính bằng phút
}, { timestamps: true }); // timestamps sẽ vẫn lưu createdAt và updatedAt

export default mongoose.model('ExamSubmission', ExamSubmissionSchema);
