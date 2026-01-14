import dotenv from 'dotenv';
dotenv.config();

import app from './app.ts';
import { connectMongo } from './db/mongo.ts';

import { startApiMonitoringService } from './services/apiMonitor.service.ts';


const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
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

startServer();
