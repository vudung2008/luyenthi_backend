import express from 'express';
import { createExam, getClassSubmissions, getExamInfo, getExamSubmissions, getSubmission, submitExam } from '../controllers/examController.js';
const router = express.Router();

router.post('/createexam', createExam);
router.post('/submitexam', submitExam);
router.get('/info', getExamInfo);
router.get('/getexamsubmissions', getExamSubmissions);
router.get('/getclasssubmissions', getClassSubmissions);
router.get('/getsubmission', getSubmission);
export default router;