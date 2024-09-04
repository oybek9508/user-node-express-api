import bodyParser from 'body-parser';
import express from 'express';

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.get('/', (req, res) => res.send('Hello from homepage.'));
app.listen(PORT, () => console.log(`Server running on PORT http://localhost:${5000}`));
