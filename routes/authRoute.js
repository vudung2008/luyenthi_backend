import express from 'express';
import { getToken, signIn, signOut, signUp } from '../controllers/authController.js';

const router = express.Router();

router.post('/signin', signIn);

router.post('/signup', signUp);

router.post('/signout', signOut);

router.get('/gettoken', getToken); 
export default router;