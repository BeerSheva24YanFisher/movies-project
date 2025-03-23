import { createError } from "../errors/errors.js";
import JwtUtils from "../security/JwtUtils.js";
import accountsService from "../service/AccountsService.js";
import expressAsyncHandler from "express-async-handler";

const BEARER = "Bearer ";
const BASIC = "Basic ";

export function authenticate() {
    return async (req, res, next) => {
        const authHeader = req.header("Authorization");
        if (authHeader) {
            try {
                if (authHeader.startsWith(BEARER)) {
                    await jwtAuthentication(req, authHeader);
                } else if (authHeader.startsWith(BASIC)) {
                    await basicAuthentication(req, authHeader);
                }
            } catch (error) {
                return res.status(401).json({ message: "Unauthorized" });
            }
        }
        next();
    };
}

async function jwtAuthentication(req, authHeader) {
    const token = authHeader.substring(BEARER.length);
    try {
        const payload = JwtUtils.verifyJwt(token);
        const serviceAccount = await accountsService.getAccount(payload.sub);
        if (!serviceAccount || serviceAccount.blocked) {
            throw createError(403, "Account blocked");
        }
        req.user = payload.sub;
        req.role = payload.role;
        req.authType = "jwt";
    } catch (error) {
        throw createError(401, "Invalid token");
    }
}

async function basicAuthentication(req, authHeader) {
    const emailPasswordBase64 = authHeader.substring(BASIC.length);
    const emailPassword = Buffer.from(emailPasswordBase64, "base64").toString("utf-8");
    const [email, password] = emailPassword.split(":");

    if (!email || !password) {
        throw createError(401, "Invalid basic auth format");
    }

    try {
        if (email === process.env.SUPERUSER_NAME && password === process.env.SUPERUSER_PASSWORD) {
            req.user = process.env.SUPERUSER_NAME;
            req.role = "admin";
            req.authType = "basic";
        } else {
            const serviceAccount = await accountsService.getAccount(email);
            if (!serviceAccount) {
                throw createError(401, "Account not found");
            }
            await accountsService.checkLogin(serviceAccount, password);
            req.user = email;
            req.role = serviceAccount.role;
            req.authType = "basic";
        }
    } catch (error) {
        throw createError(401, "Invalid credentials");
    }
}

export function checkAuthentication(paths) {
    return expressAsyncHandler(async (req, res, next) => {
        const { authentication, authorization } = paths[req.method][req.route.path];
        if (!authorization) {
            throw createError(500, "Security configuration not provided");
        }
        
        const expectedAuthType = authentication(req);
        if (expectedAuthType && req.authType !== expectedAuthType) {
            throw createError(401, "Authentication error");
        }

        if (!await authorization(req)) {
            throw createError(403, "Action not permitted");
        }

        next();
    });
}