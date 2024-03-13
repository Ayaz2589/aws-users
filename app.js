const express = require("express");
const bodyParser = require("body-parser");

const usersRouter = require("./routes/users");

const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    environment: process.env.NODE_ENV,
    uptimeInDays: Math.floor(process.uptime() / (60 * 60 * 24)),
    uptimeInHours: Math.floor(process.uptime() / (60 * 60)) % 24,
    uptimeInMinutes: Math.floor(process.uptime() / 60) % 60,
  });
});

app.use("/users", usersRouter);

module.exports = app;
