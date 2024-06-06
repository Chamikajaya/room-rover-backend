import {Request, Response} from 'express';
import {PrismaClient} from '@prisma/client';
import {SearchResponse} from '../types/searchResponse';
import {buildTheQuery} from "../utils/buildTheQuery";
import {getHotelByIdValidationRules} from "../validations/hotelValidation";
import {handleValidationErrors} from "../middleware/validate";
import Stripe from 'stripe';
import {sendBookingConfirmationEmail} from "../utils/emailRelatedUtils/sendBookingConfirmationEmail";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)


const prisma = new PrismaClient();

export const searchHotels = async (req: Request, res: Response) => {

    console.log("Route hit --> GET /api/v1/hotels/search");

    try {
        // Extract and parse pagination parameters
        const currPage = Number(req.query.page) || 1;
        const itemsPerPage = Number(req.query.itemsPerPage) || 4;
        const skip = (currPage - 1) * itemsPerPage;

        // Construct the search query
        const searchQuery = buildTheQuery(req.query);

        // extracting the sort parameter
        const sortBy = req.query.sortBy as string;

        let orderBy: any = {};

        if (sortBy === "starRatingDesc") {
            orderBy = {starRating: "desc"};
        } else if (sortBy === "pricePerNightAsc") {
            orderBy = {pricePerNight: "asc"};
        } else if (sortBy === "pricePerNightDesc") {
            orderBy = {pricePerNight: "desc"};
        }


        // Get the total count of hotels matching the search query
        const totalHotels = await prisma.hotel.count({
            where: searchQuery
        });

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalHotels / itemsPerPage);

        // Find hotels based on the search query with pagination
        const hotelsFound = await prisma.hotel.findMany({
            where: searchQuery,
            orderBy: orderBy,
            skip,
            take: itemsPerPage, // Take is the number of items to be returned (limit)
        });

        // Construct the response
        const response: SearchResponse = {
            hotelsFound,
            paginationInfo: {
                totalHotels,
                totalPages,
                currPage
            }
        };

        // Send the response
        res.status(200).json(response);

    } catch (e) {
        console.log("ERROR - SEARCH HOTEL @GET --> " + e);
        res.status(500).json({errorMessage: "Internal Server Error"});
    }
};

export const getAllHotels = async (req: Request, res: Response) => {

    console.log("Route hit --> GET /api/v1/hotels");

    try {

        const currPage = Number(req.query.page) || 1;
        const itemsPerPage = 5;
        const skip = (currPage - 1) * itemsPerPage;

        const totalHotels = await prisma.hotel.count({});

        const totalPages = Math.ceil(totalHotels / itemsPerPage);


        const hotels = await prisma.hotel.findMany(
            {
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: itemsPerPage

            }
        );

        const response: SearchResponse = {
            hotelsFound: hotels,
            paginationInfo: {
                totalHotels,
                totalPages,
                currPage
            }
        };

        // Send the response
        res.status(200).json(response);

    } catch (e) {
        console.log("ERROR - GET ALL HOTELS @GET --> " + e);
        res.status(500).json({errorMessage: "Internal Server Error"});
    }
};

export const getSingleHotel = [

    getHotelByIdValidationRules,
    handleValidationErrors,

    async (req: Request, res: Response) => {

        console.log("Route hit --> GET /api/v1/hotels/:id");

        try {
            const hotelId = req.params.id;

            const hotel = await prisma.hotel.findUnique({
                where: {
                    id: hotelId
                }
            });

            if (!hotel) {
                return res.status(404).json({errorMessage: "Hotel not found"});
            }

            res.status(200).json(hotel);

        } catch (e) {
            console.log("ERROR - GET SINGLE HOTEL @GET --> " + e);
            res.status(500).json({errorMessage: "Internal Server Error"});
        }
    }
]

export const createPaymentIntent = async (req: Request, res: Response) => {

    console.log("Route hit --> POST /api/v1/hotels/:id/bookings/payment-intent");

    try {

        // extracting userId from the request (added by cookie validation middleware)
        const userId = req.userId as string;
        // extracting hotelId from the params
        const hotelId = req.params.id;
        // extracting nights from the request body
        const {nights} = req.body;

        const hotel = await prisma.hotel.findUnique({
            where: {
                id: hotelId
            }

        });

        if (!hotel) {
            return res.status(404).json({errorMessage: "Hotel not found"});
        }

        // * calculating the total amount to be paid in the server side rather than the client side because ->
        // Integrity - By performing calculations on the server-side, we ensure that the data is consistent and accurate. This is because the server environment is controlled and less prone to manipulation compared to the client-side.
        const totalAmount = hotel.pricePerNight * nights ;

        //  creating a payment intent (A payment intent represents an attempt to collect payment from a customer)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount * 100, // converting the amount to cents (Stripe expects the amount in cents)
            currency: 'usd',
            metadata: {  // In this case, the metadata is used to store additional context about the payment intent. It's storing the userId and hotelId to keep track of which user is making the payment and for which hotel.
                userId: userId,
                hotelId: hotelId,
            }

        });

        // * The client_secret is a unique key generated by Stripe for each payment intent. It's used on the client-side to confirm the payment. If it doesn't exist, it means that the payment intent creation failed for some reason
        if (!paymentIntent.client_secret) {
            return res.status(500).json({errorMessage: "Could not create payment intent"});
        }

        const response = {
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret.toString(),
            totalAmount  // sending the most UPDATED total amount to be paid to the client
        }

        res.status(200).json(response);


    } catch (e) {
        console.log("ERROR - DO PAYMENT @POST --> " + e);
        res.status(500).json({errorMessage: "Internal Server Error"});
    }

};

export const confirmBooking = async (req: Request, res: Response) => {

    console.log("Route hit --> POST /api/v1/hotels/:id/bookings");

    try {

        // checking whether the paymentIntentId is present in the request body
        const {paymentIntentId} = req.body;
        const {checkIn, checkOut, numAdults, numChildren, totalPrice, firstName, lastName, email} = req.body;


        // getting the invoice for the booking
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId as string);

        if (!paymentIntent) {
            return res.status(400).json({errorMessage: "Payment intent not found. Null or Invalid payment intent ID"});
        }

        // checking whether the userId in the metadata of the paymentIntent is the same as the userId extracted from the cookie
        // security measure to ensure that the user who initiated the payment earlier,  is the same user who is trying to confirm the booking now
        if (paymentIntent.metadata.userId !== req.userId) {
            return res.status(403).json({errorMessage: "Payment Intent mismatch with the given info"});
        }

        // checking whether the hotelId in the metadata of the paymentIntent is the same as the hotelId extracted from the params
        // to ensure that the booking is being done for the same hotel for which the payment was made
        if (paymentIntent.metadata.hotelId !== req.params.id) {
            return res.status(400).json({errorMessage: "Payment Intent mismatch with the given info"});
        }

        // before doing the booking , checking whether the payment has been successful
        if (paymentIntent.status !== "succeeded") {
            return res.status(400).json(
                {
                    errorMessage: "Payment not successful",
                    errCode: paymentIntent.status
                },
            );
        }


        // adding the booking to the database
        const booking = await prisma.booking.create({
            data: {
                userId: req.userId,
                hotelId: req.params.id,
                checkIn,
                checkOut,
                numAdults,
                numChildren,
                totalPrice,
                email,
                firstName,
                lastName
            },
        });

        const relatedHotel = await prisma.hotel.findUnique({
            where: {
                id: req.params.id
            },
            select: {
                name: true,
                city: true,
                country: true
            }
        });

        await sendBookingConfirmationEmail(
            email,
            numAdults,
            numChildren,
            checkIn,
            checkOut ,
            totalPrice,
            relatedHotel?.name as string,
            relatedHotel?.city as string,
            relatedHotel?.country as string
        );

        res.status(200).json({successMessage: "Booking confirmation email sent successfully."});


    } catch (e) {
        console.log("ERROR - CONFIRM BOOKING & DO PAYMENT @POST --> " + e);
        res.status(500).json({errorMessage: "Internal Server Error"});
    }


};