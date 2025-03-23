import commentsService from "../service/CommentsService.js";

const userRole = "USER";
const premiumRole = "PREMIUM_USER";
const adminRole = "ADMIN";

const isPremiumUser = req => req.role === premiumRole;
const isAdmin = req => req.role === adminRole;
const isSameUser = (req, email) => req.user === email;

const commentsPaths = {
    POST: {
        "/": {
            authentication: req => "jwt",
            authorization: req => isPremiumUser(req)
        },
    },
    GET: {
        "/movie/:id": {
            authentication: req => "jwt",
            authorization: req => true
        },
        "/user/:email": {
            authentication: req => "jwt",
            authorization: req => true
        },
    },
    PUT: {
        "/": {
            authentication: req => "jwt",
            authorization: async req => {
                try {
                    const comment = await commentsService.getComment(req.body.commentId);
                    return isPremiumUser(req) && isSameUser(req, comment.email);
                } catch (error) {
                    return false;
                }
            }
        },
    },
    DELETE: {
        "/:id": {
            authentication: req => "jwt",
            authorization: async req => {
                try {
                    const comment = await commentsService.getComment(req.params.id);
                    if (!comment) return false;
                    return isAdmin(req) || (isPremiumUser(req) && isSameUser(req, comment.email));
                } catch (error) {
                    return false;
                }
            }
        },
    }
};
export default commentsPaths;
