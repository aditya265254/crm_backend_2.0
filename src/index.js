require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { DB_URL } = require("./configs/db.config");
const { PORT } = require("./configs/server.config");

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose
    .connect(DB_URL)
    .then(() => console.log("Successfully connected to MongoDB database."))
    .catch((ex) => console.error("Failed to connect to MongoDB database:", ex.message));

    

    app.get('/', (req, res) => {
        res.send("App is running ")
    })
// Basic health check route
app.get("/crm/api/v1/health", (req, res) => {
    res.status(200).send({ status: "UP", message: "CRM Application is running smoothly" });
});

// Import and register routes
require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);
require("./routes/ticket.routes")(app);

// Start server
const server = app.listen(PORT, () => {
    console.log(`CRM Server is running on port ${PORT}`);
});

server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`Error: Port ${PORT} is already in use by another process.`);
        console.error(`Please stop the process running on port ${PORT} or change PORT in .env file.`);
    } else {
        console.error("Server error:", err);
    }
});

