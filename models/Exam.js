import mongoose, { Schema } from "mongoose";

// --- Subschemas cho các loại câu hỏi ---
// Multiple choice (trắc nghiệm)
const MultiChoiceSchema = new Schema({
    content: { type: String, required: true },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: arr => arr.length >= 2,
            message: 'Phải có ít nhất 2 lựa chọn'
        }
    },
    correctAnswer: {
        type: Number,
        required: true,
        validate: {
            validator: v => v >= 0,
            message: 'Chỉ số đáp án đúng phải >= 0'
        }
    }
}, { _id: false });

// True/False item
const TrueFalseItemSchema = new Schema({
    statement: { type: String, required: true },
    correctAnswer: { type: Boolean, required: true }
}, { _id: true });

// True/False question
const TrueFalseSchema = new Schema({
    content: { type: String, required: true },
    items: {
        type: [TrueFalseItemSchema],
        required: true,
        validate: {
            validator: arr => arr.length > 0 && arr.length <= 4,
            message: 'Câu hỏi đúng/sai phải có 1-4 phát biểu'
        }
    }
}, { _id: false });

// Short answer (tự luận)
const ShortAnswerSchema = new Schema({
    content: { type: String, required: true },
    correctAnswer: { type: String, required: true }
}, { _id: false });

// --- Schema câu hỏi tổng quát ---
const QuestionSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ['multichoices', 'true-false', 'short-answer']
    },
    multichoices: MultiChoiceSchema,
    truefalse: TrueFalseSchema,
    shortanswer: ShortAnswerSchema
});

// Validator: chỉ 1 field tương ứng với type được điền
QuestionSchema.pre('validate', function (next) {
    const { type } = this;
    const hasMultichoices = this.multichoices != null;
    const hasTrueFalse = this.truefalse != null;
    const hasShortAnswer = this.shortanswer != null;

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
    time: { type: Number, required: true }, // phút
    description: { type: String },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', default: null },
    questions: [QuestionSchema],
    score: {
        multichoices: { type: Number, default: 1 },
        truefalse: { type: Number, default: 1 },
        shortanswer: { type: Number, default: 1 }
    }
}, { timestamps: true });

ExamSchema.set('toJSON', {
    virtuals: true,  // giữ các virtual nếu có
    transform: (doc, ret) => {
        // convert exam _id
        ret._id = ret._id.toString();

        // convert _id của các TrueFalseItem subdocuments
        if (ret.questions && Array.isArray(ret.questions)) {
            ret.questions = ret.questions.map(q => {
                // chỉ cần convert _id của TrueFalseItem (multichoice và shortanswer _id = false)
                if (q.type === 'true-false' && q.truefalse && Array.isArray(q.truefalse.items)) {
                    q.truefalse.items = q.truefalse.items.map(item => ({
                        ...item,
                        _id: item._id.toString()
                    }));
                }
                return q;
            });
        }

        return ret;
    }
});


export default mongoose.model('Exam', ExamSchema);
