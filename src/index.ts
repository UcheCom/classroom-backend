import express from 'express';
import cors from 'cors';
import SubjectRouter from './routes/subjects';

const app = express();
const port = 8000;

const FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL) {
    console.warn('FRONTEND_URL is not set — CORS will reject all cross-origin requests');
}

app.use(cors({
    origin: FRONTEND_URL || false,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(express.json());

app.use('/api/subjects', SubjectRouter);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});