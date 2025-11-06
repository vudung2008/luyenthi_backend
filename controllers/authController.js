import Session from '../models/Session.js';
import logger from '../libs/logger.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const REFRESH_TOKEN_TTL = 24 * 60 * 60 * 1000;
const ACCESS_TOKEN_TTL = '15m';

export const signUp = async (req, res) => {
    try {

        const { username, password, email, firstName, lastName, gender, birth } = req.body;

        if (!username || !password || !email || !firstName || !lastName || !gender || !birth) {
            return res.status(400).json({
                message: 'Thieu gia tri',
                code: 0
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: 'Mat khau phai >= 6 ky tu',
                code: 1
            })
        }

        const user = await User.findOne({
            $or: [
                { email },
                { username }
            ]
        });

        if (user) {
            return res.status(409).json({
                message: 'tai khoan da duoc dang ky'
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        await User.create({
            username,
            password: hashPassword,
            email,
            firstName,
            lastName,
            gender,
            birth
        });

        return res.status(201).json({
            message: 'Tao tai khoan thanh cong'
        })

    } catch (error) {
        logger('error', `Loi tai signUp, error: ${error}`);
        return res.status(500).json({
            message: 'Loi he thong'
        });
    }
}

export const signIn = async (req, res) => {

    try {

        const { username, password } = req.body;

        const user = await User.findOne({ username }).select('+password');

        if (!user) {
            return res.status(401).json({
                message: 'Tai khoan hoac mat khau khong chinh xac',
                code: 3
            })
        }
        const authentication = await bcrypt.compare(password, user.password);

        if (!authentication) {
            return res.status(401).json({
                message: 'Tai khoan hoac mat khau khong chinh xac',
                code: 3
            })
        }

        const refreshToken = await crypto.randomBytes(64).toString('hex');

        await Session.create({
            refreshToken,
            userId: user._id,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL)
        })

        await res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: "none" });

        logger('login', `USER: ${username}, IP: ${req.ip}`)

        return res.status(201).json({
            message: 'Dang nhap thanh cong'
        })
    } catch (error) {
        logger('error', `Loi tai signIn, error: ${error}`);
        return res.status(500).json({
            message: 'Loi he thong'
        });
    }

}

export const signOut = async (req, res) => {
    try {

        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({
                message: 'ban phai dang nhap moi co the su dung',
                code: 4
            })
        }

        await Session.deleteOne({ refreshToken: refreshToken });
        res.clearCookie('refreshToken');
        return res.sendStatus(204);

    } catch (error) {
        logger('error', `Loi tai signOut, error: ${error}`);
        return res.status(500).json({
            message: 'Loi he thong'
        });
    }
}

export const getToken = async (req, res) => {

    try {
        let accessToken = null;

        const authHeader = req.headers['Authorization'] || req.headers['authorization'];
        if (authHeader && typeof authHeader === 'string') {
            const parts = authHeader.split(' ');
            if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
                accessToken = parts[1];
            }
        }

        if (accessToken) {
            try {
                const user = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
                const isExist = await User.findById(user.userId).select('_id');
                if (!isExist) throw new Error("");

                return res.sendStatus(204);
            } catch (error) {
            }
        }

        const refreshToken = req.cookies?.refreshToken;

        const session = await Session.findOne({ refreshToken });
        if (!session || session.expiresAt < Date.now()) {
            return res.status(401).json({
                message: 'Phien dang nhap da het han',
                code: 5
            })
        }
        accessToken = await jwt.sign({
            userId: session.userId
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_TTL });


        res.status(201).json({
            message: 'Lay accessToken thanh cong',
            accessToken
        })
    } catch (error) {
        logger('error', `Loi tai getToken, error: ${error}`);
        return res.status(500).json({
            message: 'Loi he thong'
        });
    }

}