const mongoose = require('mongoose');
const { Schema } = mongoose;

// --- Subschemas cho các loại câu hỏi ---
const MultiChoiceSchema = new Schema({
    content: { type: String, required: true },
    options: { type: [String], required: true } // ['A', 'B', 'C', 'D', ...]
});

const TrueFalseOptionSchema = new Schema({
    content: { type: String, required }
})

const TrueFalseSchema = new Schema({
    content: { type: String, required: true },
    options: { type: TrueFalseOptionSchema, required: true } // ['a) ...', 'b) ...', 'c) ...', 'd) ...']
});

const ShortAnswerSchema = new Schema({
    content: { type: String, required: true }
});

// --- Schema câu hỏi tổng quát ---
const QuestionSchema = new Schema({
    type: { type: String, required: true, enum: ['multichoices', 'true-false', 'short-answer'] },
    multichoices: [MultiChoiceSchema],
    truefalse: [TrueFalseSchema],
    shortanswer: [ShortAnswerSchema]
});

// Validator: chỉ có 1 field tương ứng với type được điền
QuestionSchema.pre('validate', function (next) {
    const doc = this;
    const type = doc.type;

    const hasMultichoices = doc.multichoices && doc.multichoices.length > 0;
    const hasTrueFalse = doc.truefalse && doc.truefalse.length > 0;
    const hasShortAnswer = doc.shortanswer && doc.shortanswer.length > 0;

    let valid = false;
    if (type === 'multichoices') valid = hasMultichoices && !hasTrueFalse && !hasShortAnswer;
    if (type === 'true-false') valid = hasTrueFalse && !hasMultichoices && !hasShortAnswer;
    if (type === 'short-answer') valid = hasShortAnswer && !hasMultichoices && !hasTrueFalse;

    if (!valid) return next(new Error(`Question of type "${type}" must only have its corresponding field filled.`));
    next();
});

// --- Schema Exam ---
const ExamSchema = new Schema({
    title: { type: String, required: true },
    uploadBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    time: { type: Number, required: true }, // thời gian làm bài (phút)
    description: { type: String },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', default: null },
    questions: [QuestionSchema]
}, { timestamps: true });

// --- Export Model ---
module.exports = mongoose.model('Exam', ExamSchema);
