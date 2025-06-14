import { Router, Request, Response } from "express"; // Add Request, Response types
import {
  findStudentByRegNumber,
  getTop10ByGroup,
  numberOfStudentByLevel,
  importStudentCsv,
} from "../controllers/student.controllers";
import cors from "cors";
import { upload } from "../middlewares/upload";

const router = Router();

// Allow frontend to access the routes

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

router.get("/", (req: Request, res: Response) => {
  // Add types
  res.send("You have accessed the student route");
});

export default router;
