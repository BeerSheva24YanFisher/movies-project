import { createError } from "../errors/errors.js";
import mongoConnection from "../db/MongoConnection.js";
import { ObjectId } from "mongodb";
import accountsService from "./AccountsService.js";

class MoviesService {
    #movies

    constructor() {
        this.#movies = mongoConnection.getCollection("movies");
    }

    async getMovie(id) {
        const objectId = ObjectId.createFromHexString(id);
        const movie = await this.#movies.findOne({ _id: objectId });
        if (!movie) {
            throw createError(404, `movie with id ${id} doesn't exist`);
        }
        return movie;
    }

    async getMostRated(filter) {
        const query = [
            { $match: { "imdb.rating": { $ne: "" } } },
            { $sort: { "imdb.rating": -1 } },
            { $limit: 1 },
            { $project: { _id: 1, title: 1, imdbId: "$imdb.id", rating: "$imdb.rating" } }
        ];
        return await this.#getFilter(query, filter);
    }

    async getMostCommented(filter) {
        const query = [
            { $match: {} },
            { $sort: { num_mflix_comments: -1 } },
            { $limit: 1 },
            { $project: { _id: 1, title: 1, imdbId: "$imdb.id", comments: "$num_mflix_comments" } }
        ];
        return await this.#getFilter(query, filter);
    }

    async addRate(rateObj) {
        let count = 0;
        const { imdbId, rating, email } = rateObj;
        const movies = await this.#movies.find({ "imdb.id": imdbId }).toArray();
        for (let movie of movies) {
            const newVotes = movie.imdb.votes + 1;
            const newRating = Math.round(((movie.imdb.rating * movie.imdb.votes + rating) / newVotes) * 10) / 10;
            const resMovie = await this.#movies.findOneAndUpdate(
                { _id: movie._id },
                { $set: { "imdb.votes": newVotes, "imdb.rating": newRating } },
                { returnDocument: "after" } // Ensure we get the updated document
            );
            if (resMovie.lastErrorObject.n > 0) {  // Check if the document was actually updated
                count++;
            }
        }
        if (count) {
            await accountsService.addImdbId(email, imdbId);
        }
        return count;
    }

    async #getFilter(query, filter) {
        this.#applyFilter(query, filter);
        const movies = await this.#movies.aggregate(query).toArray();
        this.#checkFilteringResult(movies);
        return movies;
    }

    #applyFilter(query, filter) {
        const { year, actor, genres, languages, amount } = filter;
        if (year) {
            query[0].$match.year = year;
        }
        if (actor) {
            query[0].$match.cast = new RegExp(actor, "i");
        }
        if (genres) {
            query[0].$match.genres = { $all: genres };
        }
        if (languages) {
            query[0].$match.languages = { $all: languages };
        }
        query[2].$limit = amount;
    }

    #checkFilteringResult(array) {
        if (!array.length) {
            throw createError(404, `movies with specific filter don't exist`);
        }
    }
}

const moviesService = new MoviesService();
export default moviesService;
