import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import dns from 'dns';
import { inngest, functions } from './inngest/index.js';
import { serve } from 'inngest/express'
import { clerkMiddleware } from '@clerk/express';
import userRouter from './routes/userRoutes.js';
import postRouter from './routes/postRoutes.js';
import storyRouter from './routes/storyRoutes.js';

// Changing DNS server, Because my DNS server is blocking mongodb connection
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Creating express app
const app = express();

// connecting Database
await connectDB();

// Configuring middlewares
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

// Making a Home Route for checking
app.get('/', (req, res)=> res.send("Server is Running"));
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/user', userRouter);
app.use('/api/post', postRouter);
app.use('/api/story', storyRouter);

// Defining PORT number
const PORT = process.env.PORT || 4000;

// Listening to the PORT
app.listen(PORT, ()=> console.log(`Server is up and running on port http://localhost:${PORT}`))