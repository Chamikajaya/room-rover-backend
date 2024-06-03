"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    console.log("Validation errors --> " + JSON.stringify(errors.array()));
    if (!errors.isEmpty()) {
        return res.status(400).json({ errorMessage: errors.array()[0].msg });
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
