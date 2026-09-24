import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import visaRoutes from './routes/visaRoutes.js';
import ticketRoutes from './routes/ticketingRoutes.js';
import dns from 'dns';

// Node's resolver can ignore the OS DNS settings and fail SRV lookups (querySrv ECONNREFUSED)
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config({ path: './.env' });  

const app = express();

app.use(cors({
  origin: `${process.env.CORS_ORIGIN}`,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

app.use("/api/auth/", authRoutes);
app.use("/api/admin/", adminAuthRoutes);
app.use("/api/visas", visaRoutes);
app.use("/api/tickets", ticketRoutes);

mongoose.connect(`${process.env.MONGODBURL}`)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));
