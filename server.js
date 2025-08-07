const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Serve homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle form submission
app.post("/submit-request", upload.single("stlFile"), (req, res) => {
  const formData = {
    name: req.body.name,
    email: req.body.email,
    description: req.body.description,
    file: req.file ? req.file.originalname : "No file uploaded"
  };

  const logEntry = JSON.stringify(formData) + "\n";
  fs.appendFile("requests.txt", logEntry, (err) => {
    if (err) {
      console.error("Failed to save request:", err);
      res.status(500).send("Failed to save request.");
    } else {
      res.send("Request received successfully!");
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
