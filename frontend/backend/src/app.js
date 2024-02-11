import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

import userRouter from "./routes/auth.route.js";
import messageRouter from "./routes/message.route.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/messages", messageRouter);

export { app };
