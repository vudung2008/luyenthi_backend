import mongoose from "mongoose";

const classSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Ten khong duoc de trong'],
        trim: true,
        minLength: 1,
        maxLength: 50
    },
    maxMem: {
        type: Number,
        default: null
    },
    description: {
        type: String,
        default: null,
        maxLength: 100
    }

}, {
    timestamp: true
})

export default mongoose.model('Class', classSchema)