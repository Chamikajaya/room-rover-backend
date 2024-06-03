"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hotelsController_1 = require("../controllers/hotelsController");
const hotelsRouter = (0, express_1.Router)();
hotelsRouter.get("/search", hotelsController_1.searchHotels);
hotelsRouter.get("/:id", ...hotelsController_1.getSingleHotel);
exports.default = hotelsRouter;
