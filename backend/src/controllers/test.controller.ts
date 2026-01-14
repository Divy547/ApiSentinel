import type { Request, Response } from "express";
import { executeApiTest } from "../services/apiExecuter.ts";
import type { ApiTest } from "../types/apiTest.ts";
import { ALLOWED_METHODS } from "../types/apiTest.ts";
import { isValidUrl } from "../utils/validator.ts";
import { isSelfCall } from "../utils/urlGuards.ts";

export async function testApiController(req: Request, res: Response) {
    const body = req.body as ApiTest;

    if (!body.method || !body.url) {
        return res.status(400).json({ success: false, error: "method and url are required fields" });
    }
    if (isSelfCall(body.url)) {
        return res.status(400).json({ success: false, error: "Self-calls are not allowed" });
    }
    if (!ALLOWED_METHODS.includes(body.method)) {
        return res.status(400).json({ success: false, error: `method must be one of ${ALLOWED_METHODS.join(", ")}` });
    }
    if (body.method !== 'GET' && body.body) {
        delete body.body; // Remove body for non-GET requests
    }
    if (!isValidUrl(body.url)) {
        return res.status(400).json({ success: false, error: "Invalid URL format" });
    }
    const result = await executeApiTest(body);
    return res.status(200).json(result);
}