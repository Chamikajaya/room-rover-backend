import {Request, Response} from 'express';
import {PrismaClient} from '@prisma/client';
import {SearchResponse} from '../types/searchResponse';
import {buildTheQuery} from "../utils/buildTheQuery";


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

        // Get the total count of hotels matching the search query
        const totalHotels = await prisma.hotel.count({
            where: searchQuery
        });

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalHotels / itemsPerPage);

        // Find hotels based on the search query with pagination
        const hotelsFound = await prisma.hotel.findMany({
            where: searchQuery,
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
