const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true },
    plot: { type: String },
    fullplot: { type: String },
    genres: { type: [String] },
    runtime: { type: Number },
    cast: { type: [String] },
    poster: { type: String },
    languages: { type: [String] },
    released: { type: Date },
    directors: { type: [String] },
    rated: { type: String },
    awards: {
        wins: { type: Number, default: 0 },
        nominations: { type: Number, default: 0 },
        text: { type: String }
    },
    lastupdated: { type: String },
    year: { type: Number },
    imdb: {
        rating: { type: Number },
        votes: { type: Number },
        id: { type: Number }
    },
    countries: { type: [String] },
    type: { type: String },
    tomatoes: {
        viewer: {
            rating: { type: Number },
            numReviews: { type: Number },
            meter: { type: Number }
        },
        critic: {
            rating: { type: Number },
            numReviews: { type: Number },
            meter: { type: Number },
            rotten: { type: Number }
        },
        fresh: { type: Number },
        lastUpdated: { type: Date }
    },
    num_mflix_comments: { type: Number, default: 0 }
});

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
