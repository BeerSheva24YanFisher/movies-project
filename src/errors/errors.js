export function createError(status, message) {
    return { status, message };
}

export function errorHandler(error, req, res, next) {
    let { status, message } = error;
    status = status ?? 500;
    message = message ?? `internal server error ${error}`;
    res.status(status).send(message);
}