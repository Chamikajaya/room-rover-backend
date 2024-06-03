"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidationRules = exports.registerValidationRules = void 0;
const express_validator_1 = require("express-validator");
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
exports.registerValidationRules = [
    (0, express_validator_1.check)("email", "Please include a valid email").isEmail(),
    (0, express_validator_1.check)("password", "Password must contain at least 8 characters, including at least one lowercase letter, one uppercase letter, one digit, and one special character")
        .matches(passwordRegex)
        .isLength({ min: 8 }),
    (0, express_validator_1.check)("firstName", "First name is required").not().isEmpty(),
    (0, express_validator_1.check)("lastName", "Last name is required").not().isEmpty(),
];
exports.loginValidationRules = [
    (0, express_validator_1.check)("email", "Please include a valid email").isEmail(),
    (0, express_validator_1.check)("password", "Password must contain at least 8 characters, including at least one lowercase letter, one uppercase letter, one digit, and one special character")
        .matches(passwordRegex)
        .isLength({ min: 8 }),
];
