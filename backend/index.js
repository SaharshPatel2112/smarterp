const express = require("express");
const cors = require("cors");
require("dotenv").config();

const companiesRouter = require("./routes/companies");
const ledgersRouter = require("./routes/ledgers");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/companies", companiesRouter);
app.use("/api/ledgers", ledgersRouter);

app.get("/", (req, res) => {
  res.send("SmartERP backend running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
