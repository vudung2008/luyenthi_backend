import express from 'express';
import { createClass, getClassInfo, getExams, getMyClasses, joinClass } from '../controllers/classController.js';

const router = express.Router();

router.post('/joinclass', joinClass);
router.get('/getmyclasses', getMyClasses);
router.post('/createclass', createClass);
router.get('/getclassinfo', getClassInfo);

router.get('/getexams', getExams);
export default router;