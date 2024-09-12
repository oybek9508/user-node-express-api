import createHttpError from 'http-errors';
import client from '../helpers/init_redis.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../helpers/jwt_helper.js';
import validation from '../helpers/validation_schema.js';
import User from '../models/user.js';

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createUser = async (req, res, next) => {
    try {
        // const { email, password } = req.body;
        const result = await validation.authSchema.validateAsync(req.body);

        const isEmailExist = await User.findOne({ email: result.email });
        if (isEmailExist) throw createHttpError.Conflict('User already exists');

        const user = await User.create(result);
        const savedUser = await user.save();
        const accessToken = await signAccessToken(savedUser.id);
        const refreshToken = await signRefreshToken(savedUser.id);
        res.status(201).send({ accessToken, refreshToken });
    } catch (error) {
        // we first check if the error is coming from joi
        // if it is coming from joi, then we have to change the error status to 422 which says that the server did not get the request body
        if (error.isJoi) error.status = 422;
        // if the error is not from joi, the we should pass the error to the next param
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const result = await validation.authSchema.validateAsync(req.body);
        const user = await User.findOne({ email: result.email });
        if (!user) throw createHttpError.NotFound('User not registered');

        const isMatch = await user.isValidPassword(result.password);

        if (!isMatch) throw createHttpError.Unauthorized('Wrong username or password');
        const accessToken = await signAccessToken(user.id);
        const refreshToken = await signRefreshToken(user.id);

        res.send({ accessToken, refreshToken });
    } catch (error) {
        if (error.isJoi) return next(createHttpError.BadRequest('Invalid username or password'));
        next(error);
    }
};

export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) throw createHttpError.BadRequest();
        const userId = await verifyRefreshToken(token);

        const accessToken = await signAccessToken(userId);
        const refreshToken = await signRefreshToken(userId);
        res.send({ accessToken, refreshToken });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) throw createHttpError.BadRequest();
        const userId = await verifyRefreshToken(refreshToken);
        const value = await client.del(userId);
        if (value === 0) {
            throw createHttpError.InternalServerError();
        }
        return res.status(204).send();
    } catch (error) {
        next(error);
    }
};
