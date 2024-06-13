import {Router} from "express";
import {sendMessage} from "../controllers/chatbotController";

const chatbotRouter = Router();

chatbotRouter.post("/", sendMessage);

export default chatbotRouter;