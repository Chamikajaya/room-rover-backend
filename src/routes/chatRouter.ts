import express, {Router} from "express";
import {chatbotController} from "../controllers/chatbotController";

const chatRouter = Router();

chatRouter.post("/", chatbotController);

export default chatRouter;