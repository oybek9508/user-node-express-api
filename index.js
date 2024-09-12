import dotenv from 'dotenv';
import express from 'express';
import createHttpError from 'http-errors';
import morgan from 'morgan';
import './helpers/init_mongodb.js';
import './helpers/init_redis.js';
import { verifyAccessToken } from './helpers/jwt_helper.js';
import AuthRoute from './routes/auth.js';

// await client.set('foo', 'bar');
// const value = await client.get('foo');
// console.log('value', value);

dotenv.config();

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

app.get('/', verifyAccessToken, async (req, res, next) => {
    console.log(req.headers['authorization']);
    res.send('hi');
});

app.use('/auth', AuthRoute);

app.use(async (req, res, next) => {
    next(createHttpError.NotFound('This route cannot be found'));
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: err.message,
        },
    });
});

app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
