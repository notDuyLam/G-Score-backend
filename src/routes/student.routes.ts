import { Router, Request, Response } from "express"; // Add Request, Response types
import {
  findStudentByRegNumber,
  getTop10ByGroup,
  numberOfStudentByLevel,
} from "../controllers/student.controllers";
import cors from "cors";

const router = Router();

// Allow frontend to access the routes
router.use(
  cors({
    origin: "http://localhost:5173",
  })
);

router.get("/:regNumber", findStudentByRegNumber);

router.get("/group/:group", getTop10ByGroup);

router.get("/counts/:subject", numberOfStudentByLevel);

router.get("/", (req: Request, res: Response) => {
  // Add types
  res.send("You have accessed the student route");
});

export default router;
