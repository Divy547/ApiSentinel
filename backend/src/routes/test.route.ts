import { Router } from "express";
import { testApiController } from "../controllers/test.controller.js";
import { apiRateLimiter } from "../middlewares/rateLimit.js";
const router = Router();

router.post('/test', apiRateLimiter, testApiController);

export default router;