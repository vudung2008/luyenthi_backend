import mongoose from "mongoose";

const { Schema } = mongoose;

// ----- Schema cho từng câu trả lời -----
const AnswerSchema = new Schema(
    {
        questionId: { type: Schema.Types.ObjectId, required: true, ref: "Exam.questions" },
        type: { type: String, required: true, enum: ["multichoices", "true-false", "short-answer"] },

        // Trắc nghiệm nhiều lựa chọn
        multichoices: {
            selected: { type: Number }, // index đáp án học sinh chọn
            correctAnswer: { type: Number } // index đáp án đúng
        },

        // True/False
        truefalse: [
            {
                itemId: { type: Schema.Types.ObjectId, required: true },
                answer: { type: Boolean, required: true },
                correctAnswer: { type: Boolean, required: true } // đáp án đúng
            }
        ],

        // Tự luận
        shortanswer: {
            text: { type: String }, // đáp án học sinh
            correctAnswer: { type: String } // đáp án đúng
        }
    },
    { _id: false }
);

// ----- Schema cho bài làm -----
const ExamSubmissionSchema = new Schema(
    {
        examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        classId: { type: Schema.Types.ObjectId, ref: "Class" },
        answers: [AnswerSchema],
        score: { type: Number, default: 0 },
        duration: { type: Number, default: 0 } // thời gian làm bài (phút)
    },
    { timestamps: true }
);

export default mongoose.model("ExamSubmission", ExamSubmissionSchema);
