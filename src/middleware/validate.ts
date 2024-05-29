import {NextFunction, Request, Response} from "express";
import {validationResult} from "express-validator";

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    console.log("Validation errors --> " + JSON.stringify(errors.array()));
    if (!errors.isEmpty()) {
        return res.status(400).json({errorMessage: errors.array()[0].msg});
    }
    next();
};
