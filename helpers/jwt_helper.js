import jwt from 'jsonwebtoken';

export const signAccessToken = (userId) => {
    return new Promise((res, rej) => {
        const payload = {};
        const secret = process.env.ACCESS_TOKEN;

        const options = {
            expiresIn: '1h',
            issuer: 'oybek.com',
            audience: userId,
        };
        jwt.sign(payload, secret, options, (err, token) => {
            if (err) rej(err);
            res(token);
        });
    });
};
