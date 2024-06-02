export const buildTheQuery = (queryParams: any) => {
    let constructedQuery: any = {};

    if (queryParams.destination) {
        constructedQuery.OR = [
            {city: {contains: queryParams.destination, mode: 'insensitive'}},
            {country: {contains: queryParams.destination, mode: 'insensitive'}},
        ];
    }

    if (queryParams.numAdults) {
        constructedQuery.numAdults = {
            gte: parseInt(queryParams.numAdults),
        };
    }

    if (queryParams.numChildren) {
        constructedQuery.numChildren = {
            gte: parseInt(queryParams.numChildren),
        };
    }


    return constructedQuery;
};
