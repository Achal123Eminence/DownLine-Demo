import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/database.js';
import initializeOwner from './config/initializeOwner.js';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectDB();
  await initializeOwner();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();