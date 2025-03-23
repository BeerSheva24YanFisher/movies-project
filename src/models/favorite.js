const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    email: { type: String, required: true },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    viewed: { type: Boolean, default: false },
    feedBack: { type: String }
});

const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;