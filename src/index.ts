import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { sequelize } from "./config/db";
import "./models/student.model";
import cors from "cors";
import studentRoutes from "./routes/student.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "50mb" }));

// CORS configuration for production
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.FRONTEND_URL].filter(
        (origin): origin is string => typeof origin === "string"
      )
    : ["http://localhost:5173"];

console.log(allowedOrigins);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use("/api", studentRoutes);

// Test database connection instead of sync in production
if (process.env.NODE_ENV === "production") {
  sequelize
    .authenticate()
    .then(() => {
      console.log("Database connected successfully!");
    })
    .catch((error) => {
      console.error("Unable to connect to the database:", error);
    });
} else {
  sequelize.sync().then(() => {
    console.log("Database synced!");
  });
}

app.get("/", (_req: Request, res: Response) => {
  // Add types
  res.json({ message: "G-Score API is running", status: "healthy" });
});

app.get("/health", (_req: Request, res: Response) => {
  // Add types
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
