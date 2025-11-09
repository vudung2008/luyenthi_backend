import express from 'express';
import { createExam, submitExam } from '../controllers/examController.js';
const router = express.Router();

router.post('/createexam', createExam);
router.post('/submitexam', submitExam);

export default router;