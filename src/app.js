import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors({
   origin: process.env.CORS_ORIGIN,
   credentials: true,
}));


app.use(express.json({ limit: process.env.MAX_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_LIMIT }));
app.use(express.static("public"));
app.use(cookieParser());

// route import
import userRouter from "./routes/users.route.js";

// route declarations
app.use("/api/v1/users", userRouter);

// http://localhost:1000/api/v1/users -> userRouter()
export { app };
