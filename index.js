import bodyParser from 'body-parser';
import express from 'express';
import usersRoutes from './routes/users.js';

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use('/users', usersRoutes);
// app.get();
app.listen(PORT, () => console.log(`Server running on PORT http://localhost:${5000}`));
