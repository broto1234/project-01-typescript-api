import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import userRouter from './routes/user.routes';
import errorHandler from './middleware/errorHandler';
import authRouter from './routes/auth.routes';

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";

const app = express();

// Add security headers
app.use(helmet()); 

// Middleware to enable CORS
app.use(cors({
    origin: process.env.FRONTEND_URL,
  })
);  

// Logging middleware
// app.use(morgan('dev'));   // development logging format
app.use(
  morgan(
    ":method :url :status :response-time ms - :res[content-length] bytes"
  )
);

// Middleware to parse JSON request bodies
app.use(express.json());  


// Routes
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global error handling middleware
app.use(errorHandler);


export default app;