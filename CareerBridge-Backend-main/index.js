require("dotenv").config();
const mongoose = require("mongoose");

// MongoDB Atlas Connection
const MONGO_URI = process.env.MONGO_URI || "tumhara_mongodb_connection_string";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected! 🍃"))
  .catch((err) => console.error("MongoDB Connection Failed:", err));
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "backend is working" });
});

~(
  // Middlewares
  app.use(cors())
);
app.use(express.json());
app.use("/api/auth", require("./auth"));
// Express HTTP Server & Socket.io Binding
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://careerbridge-red.vercel.app/"],
    methods: ["GET", "POST"],
  },
});

// Real-Time Socket Connection
io.on("connection", (socket) => {
  console.log("⚡ User Connected:", socket.id);

  socket.on("join_chat", (userId) => {
    socket.join(userId);
  });

  socket.on("send_message", (data) => {
    io.to(data.receiverId).emit("receive_message", data);
    io.to(data.receiverId).emit("notification", {
      type: "message",
      msg: `${data.senderName} ne aapko message bheja hai!`,
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ User Disconnected");
  });
});

// AI Endpoints
app.post("/api/ai/build-resume", (req, res) => {
  const { name, role, skills, projects } = req.body;
  const resumeMarkdown = `# ${name || "User Name"}
**Role:** ${role || "Full Stack Developer"}

## Professional Summary
High-impact developer proficient in ${skills || "React, Node.js, MongoDB"}. Experienced in building scalable web applications.

## Key Projects
${projects || "- CareerBridge Platform: MERN stack based web application."}

## Technical Skills
- **Languages:** JavaScript, Python, C++
- **Frameworks:** React.js, Express.js, Tailwind CSS
- **Database:** MongoDB, PostgreSQL`;

  res.json({ success: true, resume: resumeMarkdown });
});

app.post("/api/ai/build-portfolio", (req, res) => {
  const { name, role, bio } = req.body;
  const portfolioHTML = `<!DOCTYPE html>
<html>
<head>
  <title>${name} - Portfolio</title>
  <style>
    body { background-color: #0f172a; color: #fff; font-family: sans-serif; padding: 40px; }
    h1 { color: #22d3ee; }
    button { background: #22d3ee; color: #0f172a; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }
  </style>
</head>
<body>
  <h1>${name}</h1>
  <h3>${role}</h3>
  <p>${bio || "Passionate Developer building cool projects."}</p>
  <button>Contact Me</button>
</body>
</html>`;

  res.json({ success: true, code: portfolioHTML });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 CareerBridge Backend Running on Port ${PORT}`);
});
