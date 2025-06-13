import { Router } from "express";
import {
  findStudentByRegNumber,
  getTop10ByGroup,
  importStudentCsv,
} from "../controllers/student.controllers";
import { upload } from "../middlewares/upload";

const router = Router();

router.post("/import", upload.single("file"), async (req, res, next) => {
  try {
    await importStudentCsv(req, res);
  } catch (err) {
    next(err);
  }
});

router.get("/:regNumber", findStudentByRegNumber);

router.get("/group/:group", getTop10ByGroup);

router.get("/", (req, res) => {
  res.send("You have accessed the student route");
});

export default router;
