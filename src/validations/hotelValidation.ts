import {check} from "express-validator";

export const hotelCreationValidationRules = [
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('hotelType', 'Hotel Type is required').not().isEmpty(),
    check('country', 'Country is required').not().isEmpty(),
    check('city', 'City is required').not().isEmpty(),
    check('numOfAdults', 'Number of adults is required and must be an integer').isInt({min: 1}),
    check('numOfChildren', 'Number of children is required and must be an integer').isInt({min: 0}),
    check('facilities', 'Facilities must be an array').isArray(),
    check('pricePerNight', 'Price per night is required and must be a positive number').isFloat({min: 0}),
    check('rating', 'Rating must be a number between 0 and 5').isFloat({min: 0, max: 5}),
];
