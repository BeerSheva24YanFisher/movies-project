import express from "express";
import accountsService from "../service/AccountsService.js";
import asyncHandler from "express-async-handler";
import { validator } from "../middleware/validation.js";
import { schemaEmail, schemaEmailPassword, schemaEmailRole, schemaEmailNamePassword } from "../validation/accountsSchemas.js";
import { checkAuthentication } from "../middleware/auth.js";
import accountsPaths from "../paths/accountsPaths.js";

const accountsRouter = express.Router();

// создание аккаунта администратора
accountsRouter.post("/admin", validator(schemaEmailNamePassword, "body"), checkAuthentication(accountsPaths), asyncHandler(async (req, res) => {
    await accountsService.addAdminAccount(req.body);
    res.status(201).send("admin account added");
}));

// создание пользовательского аккаунта
accountsRouter.post("/user", validator(schemaEmailNamePassword, "body"), checkAuthentication(accountsPaths), 
    asyncHandler(async (req, res) => {
    await accountsService.addAccount(req.body);
    res.status(201).send("user account added");
}));

// обновление роли пользователя
accountsRouter.put("/role", validator(schemaEmailRole, "body"), checkAuthentication(accountsPaths), asyncHandler(async (req, res) => {
    res.send(await accountsService.setRole(req.body.email, req.body.role));
}));

// обновление пароля
accountsRouter.put("/password", validator(schemaEmailPassword, "body"), checkAuthentication(accountsPaths), asyncHandler(async (req, res) => {
    await accountsService.updatePassword(req.body.email, req.body.password);
    res.send("password updated");
}));

// получение данных аккаунта по email
accountsRouter.get("/:email", validator(schemaEmail, "params"), checkAuthentication(accountsPaths), asyncHandler(async (req, res) => {
    res.send(await accountsService.getAccount(req.params.email));
}));

// блокировка аккаунта
accountsRouter.put("/block/:email", validator(schemaEmail, "params"), checkAuthentication(accountsPaths), asyncHandler(async (req, res) => {
    await accountsService.blockAccount(req.params.email);
    res.send("account blocked");
}));

// разблокировка аккаунта
accountsRouter.put("/unblock/:email", validator(schemaEmail, "params"), checkAuthentication(accountsPaths), asyncHandler(async (req, res) => {
    await accountsService.unblockAccount(req.params.email);
    res.send("account unblocked");
}));

// логин пользователя
accountsRouter.post("/login", asyncHandler(async (req, res) => { 
    res.send(await accountsService.login(req.body.email, req.body.password));
}));

// удаление аккаунта
accountsRouter.delete("/:email", validator(schemaEmail, "params"), checkAuthentication(accountsPaths), asyncHandler(async (req, res) => {
    await accountsService.deleteAccount(req.params.email);
    res.send("account deleted");
}));

export default accountsRouter;
