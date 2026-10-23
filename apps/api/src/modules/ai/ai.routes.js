import { Router } from "express";
import { chatWithAi } from "./ai.controller.js";
import { optionalAuthenticate } from "../../middleware/authenticate.middleware.js";

const router = Router();

// Allows both public visitors and authenticated patients
router.post("/chat", optionalAuthenticate || ((req, _res, next) => next()), chatWithAi);

export default router;
