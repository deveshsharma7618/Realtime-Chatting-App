import { Router } from "express";
import { getMessageHistory } from "../controllers/messages.controller.js";
import { utilsMiddleware } from "../middleware/utils.middleware.js";

const router = Router();

router.get("/history", utilsMiddleware, getMessageHistory);

export default router;
