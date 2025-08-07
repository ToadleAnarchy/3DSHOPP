const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1257068843860361236/oD_2o-3VLPp_LfjK1Hrna4q1VXZbV4Rq37cF-HbQYRt-rZ236P1Y9s7VQ1lwQWyOWzfk";
const ADMIN_PASSWORD = "ToadleAnarchy";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({ secret: "secret123", resave: false, saveUninitialized: true }));

const upload = multer({ dest: "public/uploads/" });

app.get("/", (req, res) => {
  const galleryPath = path.join(__dirname, "public", "uploads");
  const images = fs.readdirSync(galleryPath).filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f));
  let galleryHtml = images.map(img => `<img src="/uploads/${img}" width="200"/>`).join(" ");
  let html = fs.readFileSync(path.join(__dirname, "public", "index.html"), "utf8");
  html = html.replace("%GALLERY%", galleryHtml);
  res.send(html);
});

app.post("/contact", async (req, res) => {
  const { name, message } = req.body;
  await axios.post(DISCORD_WEBHOOK_URL, {
    content: `New contact form message from **${name}**:\n${message}`,
  });
  res.send("Message sent! <a href='/'>Go back</a>");
});

app.get("/admin", (req, res) => {
  let html = fs.readFileSync(path.join(__dirname, "templates", "admin.html"), "utf8");
  if (req.session && req.session.admin) {
    html = html.replace("%CONTENT%", `
      <form action="/upload" method="POST" enctype="multipart/form-data">
        <input type="file" name="image" accept="image/*" required />
        <button type="submit">Upload</button>
      </form>
      <p><a href="/">Go back to homepage</a></p>
    `);
  } else {
    html = html.replace("%CONTENT%", `
      <form action="/admin" method="POST">
        <input type="password" name="password" placeholder="Enter password" required />
        <button type="submit">Login</button>
      </form>
    `);
  }
  res.send(html);
});

app.post("/admin", (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    req.session.admin = true;
    res.redirect("/admin");
  } else {
    res.send("Incorrect password. <a href='/admin'>Try again</a>");
  }
});

app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.session.admin) return res.status(403).send("Unauthorized");
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});