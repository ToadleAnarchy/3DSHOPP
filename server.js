const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();

const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.post("/submit-request", upload.single("stlFile"), (req, res) => {
  const { name, email, description } = req.body;
  const file = req.file;

  const requestData = {
    name,
    email,
    description,
    file: file.originalname,
    storedFile: file.path,
    time: new Date().toISOString()
  };

  const dataPath = path.join(__dirname, "requests.json");
  const requests = fs.existsSync(dataPath)
    ? JSON.parse(fs.readFileSync(dataPath))
    : [];
  requests.push(requestData);
  fs.writeFileSync(dataPath, JSON.stringify(requests, null, 2));

  res.send("Request submitted! I'll talk to you soon about the payment.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
