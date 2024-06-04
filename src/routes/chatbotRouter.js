"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatbotController_1 = require("../controllers/chatbotController");
const chatbotRouter = (0, express_1.Router)();
chatbotRouter.post("/chat", chatbotController_1.sendMessage);
exports.default = chatbotRouter;
