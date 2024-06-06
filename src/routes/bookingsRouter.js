"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateCookie_1 = require("../middleware/validateCookie");
const bookingsController_1 = require("../controllers/bookingsController");
const bookingsRouter = (0, express_1.Router)();
bookingsRouter.get("/", validateCookie_1.validateCookie, bookingsController_1.getMyBookings);
exports.default = bookingsRouter;
