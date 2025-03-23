import { createError } from "../errors/errors.js";
import mongoConnection from "../db/MongoConnection.js";
import bcrypt from "bcrypt";
import JwtUtils from "../security/JwtUtils.js";
import config from "config";

const userRole = "USER";
const adminRole = "ADMIN";
const time_units = {
    "d": 1000 * 60 * 60 * 24,
    "h": 1000 * 60 * 60,
    "m": 1000 * 60,
    "s": 1000
};

class AccountsService {
    #accounts;

    constructor() {
        this.#accounts = mongoConnection.getCollection("users");
    }

    async addAccount(account) {
        return this.#addAccountWithRole(account, userRole);
    }

    async addAdminAccount(account) {
        return this.#addAccountWithRole(account, adminRole);
    }

    async #addAccountWithRole(account, role) {
        if (account.email === process.env.SUPERUSER_NAME) {
            throw createError(409, `can't create user with e-mail ${account.email}`);
        }
        const accountToSave = this.#toServiceAccount(account, role);
        try {
            await this.#accounts.insertOne(accountToSave);
            return accountToSave;
        } catch (error) {
            throw createError(409, `user with e-mail ${account.email} already exists`);
        }
    }

    async getAccount(email) {
        const account = await this.#accounts.findOne({ email });
        this.#throwNotFound(account, email);
        return account;
    }

    #throwNotFound(account, email) {
        if (!account) {
            throw createError(404, `user with e-mail ${email} doesn't exist`);
        }
    }

    async setRole(email, role) {
        const resAccount = await this.#accounts.findOneAndUpdate(
            { email: email },
            { $set: { role } },
            { returnDocument: "after" }
        );
        this.#throwNotFound(resAccount, email);
        return resAccount;
    }

    async updatePassword(email, password) {
        const account = await this.getAccount(email);
        if (bcrypt.compareSync(password, account.hashPassword)) {
            throw createError(400, `the new password should be different from the existing one`);
        }
        account.hashPassword = bcrypt.hashSync(password, config.get("accounting.salt_rounds"));
        account.expiration = getExpiration();
        
        const resAccount = await this.#accounts.findOneAndUpdate(
            { email: email },
            { $set: account },
            { returnDocument: "after" }
        );
        
        if (!resAccount) {
            throw createError(400, `password update failed`);
        }
    }

    async #updateAccountBlockStatus(email, block) {
        const resAccount = await this.#accounts.findOneAndUpdate(
            { email: email },
            { $set: { blocked: block } },
            { returnDocument: "after" }
        );
        this.#throwNotFound(resAccount, email);
    }

    async blockAccount(email) {
        this.#updateAccountBlockStatus(email, true);
    }

    async unblockAccount(email) {
        this.#updateAccountBlockStatus(email, false);
    }

    async deleteAccount(email) {
        const resAccount = await this.#accounts.findOneAndDelete({ email });
        this.#throwNotFound(resAccount, email);
    }

    async login(email, password) {
        const account = await this.getAccount(email);
        await this.checkLogin(account, password);
        return JwtUtils.getJwt(account);
    }

    async checkLogin(account, password) {
        if (!account || !await bcrypt.compare(password, account.hashPassword)) {
            throw createError(400, "wrong credentials");
        }
        if (new Date().getTime() > account.expiration) {
            throw createError(400, "password expired");
        }
        if (account.blocked) {
            throw createError(400, "account is blocked");
        }
    }

    async addImdbId(email, imdbId) {
        const account = await this.getAccount(email);
        if (account.rated_movies.includes(imdbId)) {
            throw createError(400, `user with e-mail ${email} has already rated movie ${imdbId}`);
        }
        const resAccount = await this.#accounts.findOneAndUpdate(
            { email },
            { $push: { "rated_movies": imdbId } }
        );
        this.#throwNotFound(resAccount, email);
    }

    async getRequestInformation(email) {
        let { req_start_time, req_count } = await this.getAccount(email);
        const timeWindow = convertTimeStrToInt(config.get("limitation.user_requests_time"));
        const now = new Date().getTime();

        if (req_start_time + timeWindow < now || !req_start_time) {
            req_count = 1;
            req_start_time = now;
        } else {
            req_count++;
        }

        const resAccount = await this.#accounts.findOneAndUpdate(
            { email },
            { $set: { req_start_time, req_count } }
        );
        return { req_start_time, req_count };
    }

    #toServiceAccount(account, role) {
        const hashPassword = bcrypt.hashSync(account.password, config.get("accounting.salt_rounds"));
        const expiration = getExpiration();
        const serviceAccount = { email: account.email, name: account.name, role, hashPassword, expiration };
        return serviceAccount;
    }
}

function getExpiration() {
    const expiresIn = convertTimeStrToInt(config.get("accounting.expired_in"));
    return new Date().getTime() + expiresIn;
}

export function convertTimeStrToInt(expiredInStr) {
    const amount = expiredInStr.split(/\D/)[0];
    const parseArray = expiredInStr.split(/\d/);
    const index = parseArray.findIndex(e => !!e.trim());
    const unit = parseArray[index];
    const unitValue = time_units[unit];
    if (unitValue == undefined) {
        throw createError(500, `wrong configuration: unit ${unit} doesn't exist`);
    }
    return amount * unitValue;
}

const accountsService = new AccountsService();
export default accountsService;
