import { Router } from "express";
import {
  findStudentByRegNumber,
  getTop10ByGroup,
  importStudentCsv,
  numberOfStudentByLevel,
} from "../controllers/student.controllers";
import { upload } from "../middlewares/upload";
import cors from "cors";

const router = Router();

// Allow frontend to access the routes
router.use(
  cors({
    origin: "http://localhost:5173",
  })
);

router.post("/import", upload.single("file"), async (req, res, next) => {
  try {
    await importStudentCsv(req, res);
  } catch (err) {
    next(err);
  }
});

router.get("/:regNumber", findStudentByRegNumber);

router.get("/group/:group", getTop10ByGroup);

router.get("/counts/:subject", numberOfStudentByLevel);

router.get("/", (req, res) => {
  res.send("You have accessed the student route");
});

export default router;
