import User from '../models/User.js';
import logger from '../libs/logger.js';
import bcrypt from 'bcrypt';

export const getMe = async (req, res) => {
    try {

        const userId = req.userId;
        const user = await User.findById(userId);
        return res.status(200).json(user);
    } catch (error) {
        logger('error', `Loi tai getMe, error: ${error}`);
        return res.status(500).json({
            message: 'Loi he thong'
        });
    }
}

export const updateMe = async (req, res) => {

    try {
        const data = req.body;
        // Xóa các trường không được phép sửa
        delete data._id;
        delete data.username;
        delete data.password;
        delete data.email;
        delete data.role;
        delete data.isVerified
        await User.findByIdAndUpdate(req.userId, req.body, { runValidators: true })
        return res.sendStatus(204);
    } catch (error) {
        if ((error.name === 'ValidationError')) {
            return res.status(400).json({
                message: `Gia tri khong hop le, error: ${error.message}`,
                code: 8
            })
        }
        logger('error', `Loi tai updateMe, error: ${error}`);
        return res.status(500).json({
            message: 'Loi he thong'
        });
    }

}

export const updatePassword = async (req, res) => {

    try {
        const { password, newPassword } = req.body;
        if (!password || !newPassword) {
            return res.status(400).json({
                message: 'Mat khai khong duoc bo trong'
            })
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                message: 'Mat khau phai it nhat 6 ky tu',
                code: 1
            })
        }
        const user = await User.findById(req.userId).select('+password');

        const isVeri = await bcrypt.compare(password, user.password);

        if (!isVeri) {
            return res.status(401).json({
                message: 'Tai khoan hoac mat khau khong chinh xac',
                code: 3
            })
        }

        const newPass = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(req.userId, { password: newPass });
        res.clearCookie('refreshToken');
        res.status(200).json({
            message: 'Doi mat khau thanh cong'
        });
    } catch (error) {
        logger('error', `Loi tai updatePassword, error: ${error}`);
        return res.status(500).json({
            message: 'Loi he thong'
        });
    }

}

export const getUserInfo = async (req, res) => {
    try {
        const { id, role, joinedAt } = req.query;

        if (!id) {
            return res.status(400).json({
                message: 'Khong co userId'
            })
        }

        let data = await User.findById(id).select('-email');
        data = { ...data.toObject(), role, joinedAt };
        return res.status(200).json(data);
    } catch (error) {
        logger('error', `Loi tai getUserInfo, error: ${error}`);
        return res.status(500).json({
            message: 'Loi he thong'
        });
    }

}

