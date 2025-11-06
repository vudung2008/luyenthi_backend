import mongoose from "mongoose";

const classSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Ten khong duoc de trong'],
        trim: true,
        minLength: 1,
        maxLength: 50
    },
    leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    maxMem: {
        type: Number
    },
    description: {
        type: String,
        maxLength: 100
    }

}, {
    timestamp: true
})