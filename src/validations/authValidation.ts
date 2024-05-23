import {check} from "express-validator";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerValidationRules = [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must contain at least 8 characters, including at least one lowercase letter, one uppercase letter, one digit, and one special character")
        .matches(passwordRegex)
        .isLength({min: 8}),
    check("firstName", "First name is required").not().isEmpty(),
    check("lastName", "Last name is required").not().isEmpty(),
]


export const loginValidationRules = [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must contain at least 8 characters, including at least one lowercase letter, one uppercase letter, one digit, and one special character")
        .matches(passwordRegex)
        .isLength({min: 8}),
];