import express from "express";
import favoritesService from "../service/FavoritesService.js";
import asyncHandler from "express-async-handler";
import { schemaAddFavorite, schemaDeleteFavorite, schemaUpdateFavorite } from "../validation/favoritesSchemas.js";
import { validator } from "../middleware/validation.js";
import { schemaEmail } from "../validation/accountsSchemas.js";
import { checkAuthentication } from "../middleware/auth.js";
import favoritesPaths from "../paths/favoritesPaths.js";

const favoritesRouter = express.Router();

// Добавление в избранное
favoritesRouter.post("/", validator(schemaAddFavorite, "body"), checkAuthentication(favoritesPaths), asyncHandler(async (req, res) => {
    const favorite = await favoritesService.addFavorite(req.body);
    res.status(201).send(favorite);
}));

// Получение избранных для пользователя
favoritesRouter.get("/:email", validator(schemaEmail, "params"), checkAuthentication(favoritesPaths), asyncHandler(async (req, res) => {
    const favorites = await favoritesService.getUserFavorites(req.params.email);
    res.send(favorites);
}));

// Обновление элемента в избранном
favoritesRouter.put("/", validator(schemaUpdateFavorite, "body"), checkAuthentication(favoritesPaths), asyncHandler(async (req, res) => {
    const updatedFavorite = await favoritesService.updateFavorite(req.body.favoriteId, req.body);
    res.send(updatedFavorite);
}));

// Удаление элемента из избранного
favoritesRouter.delete("/", validator(schemaDeleteFavorite, "body"), checkAuthentication(favoritesPaths), asyncHandler(async (req, res) => {
    const deletedFavorite = await favoritesService.deleteFavorite(req.body.favoriteId);
    res.send(deletedFavorite);
}));

export default favoritesRouter;
