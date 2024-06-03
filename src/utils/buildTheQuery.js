"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTheQuery = void 0;
const buildTheQuery = (queryParams) => {
    let constructedQuery = {};
    if (queryParams.destination) {
        constructedQuery.OR = [
            { city: { contains: queryParams.destination, mode: 'insensitive' } },
            { country: { contains: queryParams.destination, mode: 'insensitive' } },
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
exports.buildTheQuery = buildTheQuery;
