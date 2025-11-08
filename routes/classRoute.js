import express from 'express';
import { createClass, getClassInfo, getMyClasses, joinClass } from '../controllers/classController.js';

const router = express.Router();

router.post('/joinclass', joinClass);
router.get('/getmyclasses', getMyClasses);
router.post('/createclass', createClass);
router.get('/getclassinfo', getClassInfo);

export default router;