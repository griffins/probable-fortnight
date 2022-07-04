import express from "express";
import {requireAuthorization} from "./middleware";
import {createSaving, savings, savingsReport} from "./routes/savings";
import {auth, createAccount} from "./routes/auth";

const router = express.Router()

router.get('/savings', requireAuthorization, savings)
router.get('/savings/report', requireAuthorization, savingsReport)
router.post('/savings', requireAuthorization, createSaving)

router.post('/register', createAccount)
router.post('/auth', auth)

export default router