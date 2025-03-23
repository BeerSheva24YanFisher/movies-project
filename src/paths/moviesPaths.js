import accountsService from "../service/AccountsService.js";

const userRole = "USER";
const premiumRole = "PREMIUM_USER";
const userGetLimit = 10;

const hasPremiumRole = req => req.role === premiumRole;

const getRequestLimitAuthorization = async (req) => {
    try {
        const { req_count } = await accountsService.getRequestInformation(req.user);
        return req.role === premiumRole || (req.role === userRole && req_count <= userGetLimit);
    } catch (error) {
        console.error("Error fetching request information:", error);
        return false;
    }
}

const moviesPaths = {
    POST: {
        "/rate": {
            authentication: req => "jwt",
            authorization: req => hasPremiumRole(req)
        },
    },
    GET: {
        "/movie/:id": {
            authentication: req => "jwt",
            authorization: getRequestLimitAuthorization
        },
        "/mostrated": {
            authentication: req => "jwt",
            authorization: getRequestLimitAuthorization
        },
        "/mostcommented": {
            authentication: req => "jwt",
            authorization: getRequestLimitAuthorization
        },
    },
};

export default moviesPaths;
