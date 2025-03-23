import favoritesService from "../service/FavoritesService.js";

const premiumRole = "PREMIUM_USER";

const isPremiumUser = req => req.role === premiumRole;
const isSameUser = (req, email) => req.user === email;

const actionJwtPremOwner = {
    authentication: req => "jwt",
    authorization: async req => {
        try {
            const favorite = await favoritesService.getFavorite(req.body.favoriteId);
            return isPremiumUser(req) && isSameUser(req, favorite.email);
        } catch (error) {
            return false;
        }
    }
}

const favoritesPaths = {
    POST: {
        "/": {
            authentication: req => "jwt",
            authorization: req => isPremiumUser(req)
        }
    },
    GET: {
        "/:email": {
            authentication: req => "jwt",
            authorization: req => isPremiumUser(req) && isSameUser(req, req.params.email)
        }
    },
    PUT: {
        "/": actionJwtPremOwner
    },
    DELETE: {
        "/": actionJwtPremOwner
    }
};

export default favoritesPaths;
