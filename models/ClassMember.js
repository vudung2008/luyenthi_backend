import mongoose from "mongoose";

const classMemberSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'assistant'],
        default: 'student',
    },
    joinedAt: {
        type: Date,
        default: Date.now()
    }

}, {
    timestamps: true,
});

classMemberSchema.index({ classId: 1, userId: 1 }, { unique: true });

export default mongoose.model('ClassMember', classMemberSchema);