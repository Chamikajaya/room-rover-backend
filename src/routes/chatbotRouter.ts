import {Router} from "express";
import {sendMessage} from "../controllers/chatbotController";

const chatbotRouter = Router();

chatbotRouter.post("/chat", sendMessage);

export default chatbotRouter;