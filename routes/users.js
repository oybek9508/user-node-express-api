import express from 'express';

const router = express.Router();

const users = [
    {
        firstName: 'Oybek',
        lastName: 'Toshmatov',
        age: 28,
    },
    {
        firstName: 'Jane',
        lastName: 'Doe',
        age: 22,
    },
];

router.get('/', (req, res) => {
    console.log('users', users);
    res.send(users);
});

router.post('/', (req, res) => {
    console.log('req.body', req.body);
    res.send(req.body);
});

export default router;
