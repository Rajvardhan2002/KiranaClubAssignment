const express = require("express");
const bodyParser = require("body-parser");
const jobRoutes = require("./routes/jobRoutes");
const { initDB } = require("./database/database");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use("/api", jobRoutes);
initDB().then(() => {
  console.log("Database initialized.");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
