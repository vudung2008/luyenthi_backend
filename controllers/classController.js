import Class from '../models/Class.js';
import logger from '../libs/logger.js';
import ClassMember from '../models/ClassMember.js'

export const createClass = async (req, res) => {
    try {
        const { name, maxMem, description } = req.body;
        const { userId } = req;
        if (!name) {
            return res.status(400).json({
                message: 'Ten khong duoc de trong',
                code: 8
            })
        }


        const c = await Class.create({
            name,
            maxMem,
            description
        })

        await ClassMember.create({
            userId,
            classId: c._id,
            role: 'leader'
        })

        logger('class', `NEW CLASS: ${c.name}, USERID: ${req.userId}`)

        res.sendStatus(204)
    } catch (error) {
        logger('error', `Loi tai createClass, error: ${error}`);
        return res.status(500).json({
            message: 'Loi he thong'
        });
    }
}

export const joinClass = async (req, res) => {

    try {

        const userId = req.userId;
        const { classId } = req.body;

        if (!classId) {
            return res.status(400).json({
                message: 'Thieu classId',
                code: 8
            })
        }

        const c = await Class.findById(classId);

        if (!c) {
            return res.status(404).json({
                message: 'Lop hoc khong ton tai'
            })
        }

        if (c.leader == userId) {
            return res.status(409).json({
                message: "Da tham gia nhom roi"
            })
        }

        const myClass = await ClassMember.findOne({ userId, classId });
        if (myClass) {
            return res.status(409).json({
                message: "Da tham gia nhom roi"
            })
        }
        await ClassMember.create({
            userId,
            classId
        })

        res.status(200).json({
            message: 'Tham gia thanh cong'
        });
    } catch (error) {
        logger('error', `Loi tai joinClass, error: ${error}`);
        return res.status(500).json({
            message: 'Loi he thong'
        });
    }

}

export const getMyClasses = async (req, res) => {
    try {
        const userId = req.userId;
        const data = await ClassMember.find({ userId });
        const result = await Promise.all(
            data.map(async (item) => {
                const classInfo = await Class.findById(item.classId);
                return {
                    info: item,
                    class: classInfo
                };
            })
        );
        res.status(200).json(result);
    } catch (error) {
        logger('error', `Loi tai getMyClasses, error: ${error}`);
        return res.status(500).json({
            message: 'Loi he thong'
        });
    }
}

export const getClassInfo = async (req, res) => {
    try {

        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                message: 'Khong co classId'
            })
        }

        const cls = await Class.findById(id);
        if (!cls) {
            return res.status(403).json({
                message: 'Class ko ton tai'
            })
        }
        const members = await ClassMember.find({ classId: id });
        const data = {
            name: cls.name,
            classId: cls._id,
            maxMem: cls.maxMem,
            description: cls.description,
            createAt: cls.createAt,
            members: members.map(m => ({
                userId: m.userId,
                role: m.role,
                joinedAt: m.joinedAt
            }))
        }

        return res.status(200).json(data);
    } catch (error) {
        if (error.name === 'CastError') return res.sendStatus(400);
        logger('error', `Loi tai getClassInfo, error: ${error}`);
        return res.status(500).json({
            message: 'Loi he thong'
        });
    }

}