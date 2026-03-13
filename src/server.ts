import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { config } from './lib/utils/config/db.config';
import  setupRoutes  from './route';
import cors, { CorsOptions } from 'cors';

const app = express();
app.use(express.json());

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(s => s.trim()) ?? [
  'http://localhost:3000',
  'http://localhost:3001',
];

console.log('CORS allowed origins:', allowedOrigins);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};

app.use(cors(corsOptions));

async function startServer() {
    try {
        const conn = await mongoose.connect(config.MONGO_URI, {
            appName: 'Movies'
        });
        console.log('Connected to MongoDB:', conn.connection.name);

        app.use('/api', setupRoutes());

        app.listen(config.PORT, () => {
            console.log(`Server is running on http://localhost:${config.PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

dotenv.config();
startServer();
