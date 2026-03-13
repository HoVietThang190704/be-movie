import express from 'express';
import router from './route';

const app = express();

app.use(express.json());
app.use('/api', router);
app.get('/', (_req, res) => res.json({ ok: true, message: 'be-movies API' }));

export default app;
