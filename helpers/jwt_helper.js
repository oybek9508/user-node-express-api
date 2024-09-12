import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import client from './init_redis.js';

export const signAccessToken = (userId) => {
    return new Promise((res, rej) => {
        const payload = {};
        const secret = process.env.ACCESS_TOKEN;

        const options = {
            expiresIn: '15s',
            issuer: 'oybek.com',
            audience: userId,
        };
        jwt.sign(payload, secret, options, (err, token) => {
            if (err) {
                console.log(err.message);
                rej(createHttpError.InternalServerError);
            }
            res(token);
        });
    });
};

export const verifyAccessToken = (req, res, next) => {
    if (!req.headers['authorization']) return next(createHttpError.Unauthorized());
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader.split(' '); // ["Bearer", "token"]
    const token = bearerToken[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, payload) => {
        if (err) {
            const errorMessage = err.message === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
            return next(createHttpError.Unauthorized(errorMessage));
        }
        req.payload = payload;
        next();
    });
};

export const signRefreshToken = (userId) => {
    return new Promise((res, rej) => {
        const payload = {};
        const secret = process.env.REFRESH_TOKEN;

        const options = {
            expiresIn: '1y',
            issuer: 'oybek.com',
            audience: userId,
        };
        jwt.sign(payload, secret, options, async (err, token) => {
            if (err) {
                console.log(err.message);
                rej(createHttpError.InternalServerError);
            }
            try {
                // Store the token in Redis without a callback (using await)
                await client.set(userId, token, {
                    EX: 365 * 24 * 60 * 60, // Set expiration to 1 year
                });

                // Resolve the promise with the token
                res(token);
            } catch (err) {
                console.log('Redis SET error:', err.message);
                rej(createHttpError.InternalServerError());
            }
        });
    });
};

export const verifyRefreshToken = (refreshToken) => {
    return new Promise((res, rej) => {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN, async (err, payload) => {
            if (err) return rej(createHttpError.Unauthorized());

            const userId = payload.aud;

            try {
                // Fetch token from Redis using await, no callback
                const result = await client.get(userId);

                // If the refresh token matches what's stored in Redis
                if (refreshToken === result) {
                    return res(userId); // Resolve with userId if tokens match
                }

                // If tokens don't match, reject with Unauthorized error
                rej(createHttpError.Unauthorized());
            } catch (err) {
                // Handle Redis errors
                console.log(err.message);
                rej(createHttpError.InternalServerError());
            }
        });
    });
};
