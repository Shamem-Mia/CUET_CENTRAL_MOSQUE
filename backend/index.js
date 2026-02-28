import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/dbConnection.js";
import router from "./src/routes/authRoute.js";
import userRouter from "./src/routes/userRoute.js";

const app = express();
const port = process.env.PORT;

connectDB();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// api end point
app.use("/api/auth", router);
app.use("/api/users", userRouter);

app.listen(port, () => {
  console.log(`Server started on PORT ${port} `);
});
