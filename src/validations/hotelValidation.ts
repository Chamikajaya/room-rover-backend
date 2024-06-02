import {check} from "express-validator";

export const hotelCreationValidationRules = [
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('type', 'Hotel Type is required').not().isEmpty(),
    check('country', 'Country is required').not().isEmpty(),
    check('city', 'City is required').not().isEmpty(),
    check('facilities', 'Facilities must be an array').isArray(),
    check('pricePerNight', 'Price per night is required and must be a positive number').isFloat({min: 0}),
    check('starRating', 'Rating must be a number between 0 and 5').isFloat({min: 0, max: 5}),
    check('numAdults', 'Number of adults is required').isInt({min: 1}),
    check('numChildren', 'Number of children is required').isInt({min: 0}),
];
