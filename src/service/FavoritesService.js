import { createError } from "../errors/errors.js";
import mongoConnection from "../db/MongoConnection.js";
import accountsService from "./AccountsService.js";
import moviesService from "./MoviesService.js";
import { ObjectId } from "mongodb";

class FavoritesService {
    #favorites

    constructor() {
        this.#favorites = mongoConnection.getCollection("favorites");
    }

    async addFavorite(favorite) {
        let { email, movie_id, feed_back, viewed } = favorite;
        await accountsService.getAccount(email);
        await moviesService.getMovie(movie_id);
        viewed = viewed ?? false;
        feed_back = feed_back ?? "";
        const objectToAdd = { email, movie_id: ObjectId.createFromHexString(movie_id), feed_back, viewed };
        const resFavorite = await this.#favorites.insertOne(objectToAdd);
        if (!resFavorite.acknowledged) {
            throw createError(400, "favorite hasn't been added");
        }
        return objectToAdd;
    }

    async getUserFavorites(email) {
        const resFavorites = await this.#favorites.find({ email }).toArray();
        if (!resFavorites.length) {
            throw createError(404, `user with e-mail ${email} doesn't have any favorites`);
        }
        return resFavorites;
    }

    async updateFavorite(id, objectToUpdate) {
        const { viewed, feed_back } = objectToUpdate;
        const resFavorite = await this.#favorites.findOneAndUpdate(
            { _id: ObjectId.createFromHexString(id) },
            { $set: { viewed, feed_back } },
            { returnDocument: "after" }
        );
        this.#throwNotFound(resFavorite, id);
        return resFavorite;
    }

    async deleteFavorite(id) {
        const resFavorite = await this.#favorites.findOneAndDelete({ _id: ObjectId.createFromHexString(id) });
        this.#throwNotFound(resFavorite, id);
        return resFavorite;
    }

    async getFavorite(id) {
        const resFavorite = await this.#favorites.findOne({ _id: ObjectId.createFromHexString(id) });
        this.#throwNotFound(resFavorite, id);
        return resFavorite;
    }

    #throwNotFound(resFavorite, id) {
        if (!resFavorite) {
            throw createError(404, `favorite with id ${id} doesn't exist`);
        }
    }
}

const favoritesService = new FavoritesService();
export default favoritesService;
