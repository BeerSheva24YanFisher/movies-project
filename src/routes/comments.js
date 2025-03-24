import express from "express";
import commentsService from "../service/CommentsService.js";
import expressAsyncHandler from "express-async-handler";
import { schemaId } from "../validation/moviesSchemas.js";
import { schemaEmail } from "../validation/accountsSchemas.js";
import { validator } from "../middleware/validation.js";
import { schemaAddComment, schemaUpdateComment } from "../validation/commentsSchemas.js";
import { checkAuthentication } from "../middleware/auth.js";
import commentsPaths from "../paths/commentsPaths.js";

const commentsRouter = express.Router();

// Получение комментариев для фильма
commentsRouter.get("/movie/:id", validator(schemaId, "params"), checkAuthentication(commentsPaths), expressAsyncHandler(async (req, res) => {
    const comments = await commentsService.getMovieComments(req.params.id);
    res.send(comments);
}));

// Получение комментариев пользователя
commentsRouter.get("/user/:email", validator(schemaEmail, "params"), checkAuthentication(commentsPaths), expressAsyncHandler(async (req, res) => {
    const comments = await commentsService.getUserComments(req.params.email);
    res.send(comments);
}));

// Добавление комментария
commentsRouter.post("/", validator(schemaAddComment, "body"), checkAuthentication(commentsPaths), expressAsyncHandler(async (req, res) => {
    const newComment = await commentsService.addComment(req.body);
    res.status(201).send(newComment);
}));

// Обновление комментария
commentsRouter.put("/", validator(schemaUpdateComment, "body"), checkAuthentication(commentsPaths), expressAsyncHandler(async (req, res) => {
    const updatedComment = await commentsService.updateComment(req.body.commentId, req.body.text);
    res.send(updatedComment);
}));

// Удаление комментария
commentsRouter.delete("/:id", validator(schemaId, "params"), checkAuthentication(commentsPaths), expressAsyncHandler(async (req, res) => {
    await commentsService.deleteComment(req.params.id);
    res.send("comment deleted");
}));

export default commentsRouter;
