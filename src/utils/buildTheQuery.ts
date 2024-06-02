export const buildTheQuery = (queryParams: any) => {
    let constructedQuery: any = {};

    if (queryParams.destination) {
        constructedQuery.OR = [
            { city: { contains: queryParams.destination, mode: 'insensitive' } },
            { country: { contains: queryParams.destination, mode: 'insensitive' } },
        ];
    }
    //  ! FAILS DUE TO STRING TYPE PRISMA
    if (queryParams.numAdults) {
        constructedQuery.numAdults = {
            gte: parseInt(queryParams.numAdults),
        };
    }

    //  ! FAILS DUE TO STRING TYPE PRISMA

    if (queryParams.childCount) {
        constructedQuery.childCount = {
            gte: parseInt(queryParams.childCount),
        };
    }

    console.log(constructedQuery);

    // if (queryParams.facilities) {
    //     constructedQuery.facilities = {
    //         hasEvery: Array.isArray(queryParams.facilities)
    //             ? queryParams.facilities
    //             : [queryParams.facilities],
    //     };
    // }
    //
    // if (queryParams.types) {
    //     constructedQuery.type = {
    //         in: Array.isArray(queryParams.types)
    //             ? queryParams.types
    //             : [queryParams.types],
    //     };
    // }
    //
    // if (queryParams.stars) {
    //     const starRatings = Array.isArray(queryParams.stars)
    //         ? queryParams.stars.map((star: string) => parseInt(star))
    //         : [parseInt(queryParams.stars)];
    //
    //     constructedQuery.starRating = { in: starRatings };
    // }
    //
    // if (queryParams.maxPrice) {
    //     constructedQuery.pricePerNight = {
    //         lte: parseInt(queryParams.maxPrice),
    //     };
    // }

    return constructedQuery;
};
