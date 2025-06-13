import express from "express";
import dotenv from "dotenv";
import { sequelize } from "./config/db";
import "./models/student.model";
import cors from "cors";
import studentRoutes from "./routes/student.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", studentRoutes);

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

sequelize.sync().then(() => {
  console.log("Database synced!");
});

app.get("/", (_req, res) => {
  res.send("server is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
