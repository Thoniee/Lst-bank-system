import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import accountRoutes from './routes/account';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api', accountRoutes);

mongoose.connect(process.env.MONGODB_URI || '', {
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

export default app;
