import express from "express";
import moviesService from "../service/MoviesService.js";
import expressAsyncHandler from "express-async-handler";
import { schemaId, schemaRating, schemaFilter } from "../validation/moviesSchemas.js";
import { validator } from "../middleware/validation.js";
import { checkAuthentication } from "../middleware/auth.js";
import moviesPaths from "../paths/moviesPaths.js";

const moviesRouter = express.Router();

// Получение информации о фильме
moviesRouter.get("/movie/:id", validator(schemaId, "params"), checkAuthentication(moviesPaths), expressAsyncHandler(async (req, res) => {
    const movie = await moviesService.getMovie(req.params.id);
    res.send(movie);
}));

// Получение списка самых высоко оцененных фильмов
moviesRouter.get("/mostrated", validator(schemaFilter, "body"), checkAuthentication(moviesPaths), 
    expressAsyncHandler(async (req, res) => {
    const mostRatedMovies = await moviesService.getMostRated(req.body);
    res.send(mostRatedMovies);
}));

// Получение списка самых комментируемых фильмов
moviesRouter.get("/mostcommented", validator(schemaFilter, "body"), checkAuthentication(moviesPaths),
    expressAsyncHandler(async (req, res) => {
    const mostCommentedMovies = await moviesService.getMostCommented(req.body);
    res.send(mostCommentedMovies);
}));

// Оценка фильма пользователем
moviesRouter.post("/rate", validator(schemaRating, "body"), checkAuthentication(moviesPaths),
    expressAsyncHandler(async (req, res) => {
    const rating = await moviesService.addRate({...req.body, email: req.user});
    res.send({ number: rating });
}));

export default moviesRouter;