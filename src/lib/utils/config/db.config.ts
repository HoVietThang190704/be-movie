import dotenv from 'dotenv';
dotenv.config();

export const config = {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: process.env.PORT || '5000',
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/be-movies',
}