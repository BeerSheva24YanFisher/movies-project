import jwt from "jsonwebtoken";
import { convertTimeStrToInt } from "../service/AccountsService.js";
import config from "config";

export default class JwtUtils {

    static getJwt(seviceAccount) {
        return jwt.sign(
            { role: seviceAccount.role },
            process.env.JWT_SECRET,
            { subject: seviceAccount.email, expiresIn: convertTimeStrToInt(config.get("accounting.expired_in")) + "" }
        );
    }

    static verifyJwt(token) {
        return jwt.verify(token, process.env.JWT_SECRET);
    }

}