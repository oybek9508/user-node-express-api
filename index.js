import dotenv from 'dotenv';
import express from 'express';
import createHttpError from 'http-errors';
import morgan from 'morgan';
import './helpers/init_mongodb.js';
import AuthRoute from './routes/auth.js';

dotenv.config();

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

app.get('/', async (req, res, next) => {
    res.send('hi');
});

app.use('/auth', AuthRoute);

app.use(async (req, res, next) => {
    // const error = new Error('Not found');
    // error.status = 404;
    // next(error);
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
