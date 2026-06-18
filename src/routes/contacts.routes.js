import { Router } from "express";
import { 
    getContacts, 
    searchContact, 
    sendContactRequest, 
    getPendingRequests, 
    acceptContactRequest, 
    rejectContactRequest 
} from "../controllers/contacts.controller.js";
import { utilsMiddleware } from "../middleware/utils.middleware.js";

const router = Router();

router.get("/get-contacts", utilsMiddleware, getContacts);
router.post("/search-contact", utilsMiddleware, searchContact);
router.post("/send-request", utilsMiddleware, sendContactRequest);
router.get("/pending-requests", utilsMiddleware, getPendingRequests);
router.post("/accept-request", utilsMiddleware, acceptContactRequest);
router.post("/reject-request", utilsMiddleware, rejectContactRequest);

export default router;