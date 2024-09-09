import express from 'express';
import createHttpError from 'http-errors';
import validation from '../helpers/validation_schema.js';
import User from '../models/user.js';

const router = express.Router();

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/register', async (req, res, next) => {
    try {
        // const { email, password } = req.body;
        const result = await validation.authSchema.validateAsync(req.body);

        const isEmailExist = await User.findOne({ email: result.email });
        if (isEmailExist) throw createHttpError.Conflict('User already exists');

        const user = await User.create(result);
        const savedUser = await user.save();
        res.status(201).send(savedUser);
    } catch (error) {
        // we first check if the error is coming from joi
        // if it is coming from joi, then we have to change the error status to 422 which says that the server did not get the request body
        if (error.isJoi) error.status = 422;
        // if the error is not from joi, the we should pass the error to the next param
        next(error);
    }
});

router.post('/login', async (req, res) => {
    res.send('login router');
});

router.post('/refresh-token', async (req, res) => {
    res.send('refresh token router');
});

router.delete('/logout', async (req, res) => {
    res.send('logout router');
});
export default router;
