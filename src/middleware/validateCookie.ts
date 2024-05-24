import {Response, Request, NextFunction} from "express";
import jwt from "jsonwebtoken";

// extending the Request object to include the userId --> @type-script
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export const validateCookie = (req: Request, res: Response, next: NextFunction) => {

    // check if the token exists
    const token = req.cookies.token;

    // if the token does not exist, then the user is not authenticated
    if (!token) {
        return res.status(401).json({errorMessage: "Unauthorized"});
    }

    try {

        // verify the token -- This is vital because the token could be tampered with or expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        // get the userId from the decoded token (this is possible because we added the userId to the token when we generated it 😊)
        req.userId = (decoded as any).userId;

        next();


    } catch (e) {
        console.log("ERROR - VALIDATE COOKIE --> " + e);
        return res.status(401).json({errorMessage: "Unauthorized"});
    }


}