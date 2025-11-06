import jwt from 'jsonwebtoken';
import logger from '../libs/logger.js';
import User from '../models/User.js'

const ACCESS_TOKEN_TTL = '15m';

export default async (req, res, next) => {

    try {

        let accessToken = null;

        const authHeader = req.headers['Authorization'] || req.headers['authorization'];
        if (authHeader && typeof authHeader === 'string') {
            const parts = authHeader.split(' ');
            if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
                accessToken = parts[1];
            }
        }
        else {
            return res.status(403).json({
                message: 'Token da het han hoac khong hop le',
                code: 6
            })
        }

        if (accessToken) {
            try {
                const decode = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
                req.userId = decode.userId;
                const user = await User.findById(req.userId).select('_id'); // chỉ lấy _id → giảm dữ liệu trả về
                if (!user) {
                    return res.status(401).json({ message: 'User khong ton tai', code: 3 });
                }
                next();
            } catch (error) {

            }
        }
    } catch (error) {
        logger('error', `Loi tai authMiddleware, error: ${error}`);
        return res.status(500).json({
            message: 'Loi he thong'
        });
    }
}

