import express from 'express';
import rateLimit from 'express-rate-limit';
import { getMe, updateMe, updatePassword } from '../controllers/meController.js';

const router = express.Router();

router.get('/getme', getMe);

router.put('/updateme', rateLimit({
    windowMs: 60 * 1000, // 1 phút
    max: 1,
    standardHeaders: true, // gửi X-RateLimit-* headers
    legacyHeaders: false,  // bỏ X-RateLimit-* kiểu cũ
    message: {
        message: 'Ban da gui request qua nhieu.',
        code: 7
    },
}), updateMe);

router.put('/updatepassword', rateLimit({
    windowMs: 60 * 1000, // 1 phút
    max: 1,
    standardHeaders: true, // gửi X-RateLimit-* headers
    legacyHeaders: false,  // bỏ X-RateLimit-* kiểu cũ
    message: {
        message: 'Ban da gui request qua nhieu.',
        code: 7
    },
}), updatePassword);

export default router;