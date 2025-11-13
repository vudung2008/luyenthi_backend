import express from 'express';
import { createExam, getExamInfo, submitExam } from '../controllers/examController.js';
const router = express.Router();

router.post('/createexam', createExam);
router.post('/submitexam', submitExam);
router.get('/info', getExamInfo);

export default router;