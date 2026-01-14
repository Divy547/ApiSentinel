import { Router } from "express";

import { createApiConfig, deleteApiConfig, getAllApiConfigs, getApiConfigById, getConfigsWithStatus, updateApiConfig } from "../controllers/apiConfig.controller.js";

const router = Router();

router.get("/with-status", getConfigsWithStatus);

router.post("/", createApiConfig);
router.get("/", getAllApiConfigs);

router.get("/:id", getApiConfigById);
router.put("/:id", updateApiConfig);
router.delete("/:id", deleteApiConfig);

export default router;


