import express from "express";
import moviesRouter from "./src/routes/movies.js";
import { errorHandler } from "./src/errors/errors.js";
import commentsRouter from "./src/routes/comments.js";
import accountsRouter from "./src/routes/accounts.js";
import favoritesRouter from "./src/routes/favorites.js";
import { logger, loggerAuth } from "./src/loggers/logger.js";
import { authenticate } from "./src/middleware/auth.js";

const port = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(logger);
app.use(loggerAuth);
app.use(authenticate());
app.use("/api/movies", moviesRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/favorites", favoritesRouter);
app.use((req, res) => res.status(404).send(`path ${req.path} is not found`));
app.use(errorHandler);

app.listen(port, () => console.log(`server is listening on port ${port}`));