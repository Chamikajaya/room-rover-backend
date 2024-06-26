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


// The validateCookie middleware checks if the request contains a valid JWT token in the cookies.

export const validateCookie = (req: Request, res: Response, next: NextFunction) => {

    console.log("Route hit --> validateCookie.ts")

    // check if the token exists
    const token = req.cookies.token;

    console.log("Token --> " + token)

    // if the token does not exist, then the user is not authenticated
    if (!token) {
        console.log("ERROR - VALIDATE COOKIE --> No token found")
        return res.status(401).json({errorMessage: "Unauthorized"});
    }

    try {

        console.log("Token found --> " + token)



        // verify the token -- This is vital because the token could be tampered with or expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        // get the userId from the decoded token (this is possible because we added the userId to the token when we generated it 😊)
        // If the token is valid, the user ID is extracted from the token and attached to the request object.
        req.userId = (decoded as any).userId;


        next();


    } catch (e) {
        console.log("ERROR - VALIDATE COOKIE --> " + e);
        return res.status(401).json({errorMessage: "Unauthorized"});
    }


}