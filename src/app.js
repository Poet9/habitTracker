const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
require('./mongoose');
const userRouter = require('./routers/user');
const habitRouter = require('./routers/habit');

const app = express();
app.use(cors({
   origin: 'http://localhost:5000',
   allowedHeaders: ['content-type, Authorization, Accept'],
   methods: 'POST, GET, PATCH, DELETE, OPTIONS',
   credentials: true,
   preflightContinue: false
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api/users/", userRouter);
app.use("/api/habits/", habitRouter);

module.exports = app;