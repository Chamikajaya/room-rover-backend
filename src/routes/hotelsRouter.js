"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hotelsController_1 = require("../controllers/hotelsController");
const validateCookie_1 = require("../middleware/validateCookie");
const hotelsRouter = (0, express_1.Router)();
hotelsRouter.get("/search", hotelsController_1.searchHotels);
hotelsRouter.get("/:id", ...hotelsController_1.getSingleHotel);
hotelsRouter.post("/:id/bookings/payment-intent", validateCookie_1.validateCookie, hotelsController_1.doPayment);
exports.default = hotelsRouter;
