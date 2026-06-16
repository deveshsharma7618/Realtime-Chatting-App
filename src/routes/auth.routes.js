import { Router } from "express";


const router = Router()
import { register, login, verifyOtp, session } from '../controllers/auth.controller.js'
import { validate } from '../utils/validate.js'
import authValidator from '../validator/auth.validator.js'
import { utilsMiddleware } from '../middleware/utils.middleware.js'

router.post('/register', authValidator.registerValidator, validate, register)
router.post("/verify-otp", utilsMiddleware, verifyOtp);
router.get("/session", utilsMiddleware, session);
router.post('/login', authValidator.loginValidator, validate, login)

export default router;

