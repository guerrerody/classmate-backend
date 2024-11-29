"use strict";

import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import http from "http";
import helmet from "helmet";
import fs from "fs";
import path from "path";
import session from "express-session";

import { errorHandler } from "./controller/error/errorHandler";
import { blockJWT, protect } from "./middleware/auth";
import globalRouter from "./routes/global";
import authRouter from "./routes/auth";
import services from "./routes/services";
import chat from "./routes/chat";
import user from "./routes/user";

const app = express();

const server = http.createServer(app);
export const sessionMiddleWare = session({
  secret: process.env.SECRET as string,
  resave: false,
  saveUninitialized: false,
});
server.headersTimeout = 5000;
server.requestTimeout = 10000;
app.set("trust proxy", true);
app.use(sessionMiddleWare);

app.use(cors());
app.use(helmet());
const accessLogStream = fs.createWriteStream(path.join("./", "access.log"), { flags: "a" });

// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));
app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", globalRouter);

app.use("/api/auth", authRouter);

app.use("/api/services", blockJWT, protect, services);
app.use("/api/user", blockJWT, protect, user);
app.use("/api/chat", blockJWT, protect, chat);

app.use(errorHandler);

export default server;
