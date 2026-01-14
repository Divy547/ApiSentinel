import express from 'express';
import type { Application } from 'express';
import testRoute from './routes/test.route.js';
import apiConfigRoutes from './routes/apiConfig.route.js';
import testExecutorRoute from './routes/testExecuter.route.js';
import apiMonitorRoutes from "./routes/apiMonitorLog.route.js";
import settingsRoute from "./routes/settings.route.js";
import cors from "cors";

const app: Application = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(",") || ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);





app.use(express.json({ limit: '100kb' }));
app.use('/api', testRoute);
app.use("/api/settings", settingsRoute);
app.use('/api/configs', apiConfigRoutes);
app.use("/api/monitor", apiMonitorRoutes);
app.use('/dev', testExecutorRoute);


export default app; 
