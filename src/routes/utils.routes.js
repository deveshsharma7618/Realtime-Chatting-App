import { Router } from "express";
import { deleteUser, updateUser } from "../controllers/utils.controller.js";
import { utilsMiddleware } from "../middleware/utils.middleware.js";

const router = Router();

router.delete('/user/delete-user', utilsMiddleware, deleteUser);
router.put('/user/update-username', utilsMiddleware,  updateUser);


export default router;