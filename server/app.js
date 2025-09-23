require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware");
require("./utilities/configurePassport");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", routes);
app.use("*splat", notFoundHandler);

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
