import { Router } from "express";
import { testApiController } from "../controllers/test.controller.ts";
import { apiRateLimiter } from "../middlewares/rateLimit.ts";
const router = Router();

router.post('/test', apiRateLimiter, testApiController);

export default router;