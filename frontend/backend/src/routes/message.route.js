import express from "express";
import { getMessages, addMessage } from "../controllers/message.contoller.js";

const router = express.Router();

router.post("/addmsg/", addMessage);
router.post("/getmsg/", getMessages);

export default router;
