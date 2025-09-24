require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware");
require("./utilities/configurePassport");

const app = express();

const origin =
  process.env.NODE_ENV.trim() === "production"
    ? process.env.CLIENT_ORIGIN
    : "http://localhost:5173";

app.use(
  cors({
    origin,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/v1", routes);
app.use("*splat", notFoundHandler);

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
