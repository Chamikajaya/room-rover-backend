import {Hotel} from "@prisma/client";

export type SearchResponse = {
    hotelsFound: Hotel[];
    paginationInfo: {
        totalHotels: number;
        totalPages: number;
        currPage: number;
    }
}