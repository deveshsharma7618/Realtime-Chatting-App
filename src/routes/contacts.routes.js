import { Router } from "express";
import { getContacts } from "../controllers/contacts.controller.js"
import { utilsMiddleware } from "../middleware/utils.middleware.js";

const router = Router();

router.get("/get-contacts", utilsMiddleware, getContacts  );


export default router;