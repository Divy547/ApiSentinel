import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectMongo } from './db/mongo.js';

import { startApiMonitoringService } from './services/apiMonitor.service.js';


const PORT = Number(process.env.PORT) || 3000;

async function starjserver() {
  try {
    await connectMongo(process.env.MONGO_URI!);
    startApiMonitoringService();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

starjserver();
