const adminRole = "ADMIN";

const isAdmin = req => req.role === adminRole;

const actionJwtAdmin = {
    authentication: req => "jwt",
    authorization: req => isAdmin(req)
};

const accountsPaths = {
    POST: {
        "/admin": {
            authentication: req => "basic",
            authorization: req => req.user && req.user === process.env.SUPERUSER_NAME
        },
        "/user": {
            authentication: req => "",
            authorization: req => true
        }
    },
    PUT: {
        "/role": actionJwtAdmin,
        "/password": {
            authentication: req => "jwt",
            authorization: req => isAdmin(req) || req.user === req.body?.email
        },
        "/block/:email": actionJwtAdmin,
        "/unblock/:email": actionJwtAdmin
    },
    GET: {
        "/:email": {
            authentication: req => "jwt",
            authorization: req => isAdmin(req) || req.user === req.params?.email
        }
    },
    DELETE: {
        "/:email": {
            authentication: req => "jwt",
            authorization: req => isAdmin(req) || req.user === req.params?.email
        }
    }
};

export default accountsPaths;
