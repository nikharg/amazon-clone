const express = require("express");
const app = express();
require("./db/conn");
const Products = require("./models/productsSchema");
const DefaultData = require("./defaultdata");
const cors = require("cors");
const router = require("./routes/router");
const cookieParser = require("cookie-parser");
const path = require("path");

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(router);

__dirname = path.resolve();

const port = process.env.PORT || 8005;

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

app.listen(port, () => {
  console.log(`Server is running at port ${port}...`);
});
DefaultData();
