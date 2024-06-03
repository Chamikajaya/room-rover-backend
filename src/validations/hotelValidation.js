"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHotelByIdValidationRules = exports.hotelCreationValidationRules = void 0;
const express_validator_1 = require("express-validator");
exports.hotelCreationValidationRules = [
    (0, express_validator_1.check)('name', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('description', 'Description is required').not().isEmpty(),
    (0, express_validator_1.check)('type', 'Hotel Type is required').not().isEmpty(),
    (0, express_validator_1.check)('country', 'Country is required').not().isEmpty(),
    (0, express_validator_1.check)('city', 'City is required').not().isEmpty(),
    (0, express_validator_1.check)('facilities', 'Facilities must be an array').isArray(),
    (0, express_validator_1.check)('pricePerNight', 'Price per night is required and must be a positive number').isFloat({ min: 0 }),
    (0, express_validator_1.check)('starRating', 'Rating must be a number between 0 and 5').isFloat({ min: 0, max: 5 }),
    (0, express_validator_1.check)('numAdults', 'Number of adults is required').isInt({ min: 1 }),
    (0, express_validator_1.check)('numChildren', 'Number of children is required').isInt({ min: 0 }),
];
exports.getHotelByIdValidationRules = [
    (0, express_validator_1.check)('id', 'Hotel ID is required').not().isEmpty(),
];
