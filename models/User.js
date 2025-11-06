import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'username khong duoc de trong'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: [6, 'Mat khai phai it nhat 6 ky tu'],
        select: false
    },
    email: {
        type: String,
        required: [true, 'Email khong duoc bo trong'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, "Email không hợp lệ"]
    },
    firstName: {
        type: String,
        required: [true, 'Ho ten khong duoc de trong'],
        trim: true,
        minlength: 2,
        maxlength: 10
    },
    lastName: {
        type: String,
        required: [true, 'Ho ten khong duoc de trong'],
        trim: true,
        minlength: 2,
        maxlength: 10
    },
    gender: {
        type: String,
        required: true,
        enum: ['female', 'male']
    },
    birth: {
        type: Date,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'], // 0 - Hoc sinh, 1 - Giao vien, 2 - Admin
        default: 'student'
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    bio: {
        type: String,
        maxlength: 100
    }
},
    {
        timestamps: true, // tự tạo createdAt và updatedAt
        versionKey: false,
        toJSON: {
            transform: (doc, ret) => {
                delete ret.password; // ẩn password khi toJSON
                return ret;
            }
        }
    })

export default mongoose.model('User', userSchema);