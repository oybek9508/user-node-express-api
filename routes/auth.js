import express from 'express';
import { createUser, getUsers, login, logout, refreshToken } from '../controllers/auth.js';

const router = express.Router();

router.get('/users', getUsers);

router.post('/register', createUser);

router.post('/login', login);

router.post('/refresh-token', refreshToken);

router.delete('/logout', logout);

export default router;
