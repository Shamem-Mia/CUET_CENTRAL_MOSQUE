import express from "express";
import authUser from "../middlewares/userAuth.js";
import { getUserData } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/user-data", authUser, getUserData);

export default userRouter;
