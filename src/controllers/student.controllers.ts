import { Request, Response } from "express";
import { Student } from "../models/student.model";
import { Op, Sequelize } from "sequelize";
import { parse } from "csv-parse/sync";
import { sequelize } from "../config/db";

export const findStudentByRegNumber = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { regNumber } = req.params;
    if (!regNumber) {
      res.status(400).json({ message: "Registration number is required." });
      return;
    }

    const student = await Student.findByPk(regNumber);

    if (!student) {
      res.status(404).json({ message: "Student not found." });
      return;
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error.",
      error: (error as Error).message,
    });
  }
};

export const getTop10ByGroup = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { group } = req.params;
    if (group === "A") {
      const studentData = await Student.findAll({
        where: {
          [Op.and]: [
            { toan: { [Op.not]: null } },
            { vat_li: { [Op.not]: null } },
            { hoa_hoc: { [Op.not]: null } },
          ],
        } as any,
        attributes: {
          include: [[Sequelize.literal("toan + vat_li + hoa_hoc"), "tongDiem"]],
        },
        order: [[Sequelize.literal("toan + vat_li + hoa_hoc"), "DESC"]], // Use the full expression
        limit: 10,
      });
      res.json(studentData);
      return;
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error.",
      error: (error as Error).message,
    });
  }
};
function parseNullableFloat(value: string | null): number | null {
  if (!value) return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

interface StudentRecord {
  sbd: string;
  toan: number | null;
  ngu_van: number | null;
  ngoai_ngu: number | null;
  vat_li: number | null;
  hoa_hoc: number | null;
  sinh_hoc: number | null;
  lich_su: number | null;
  dia_li: number | null;
  gdcd: number | null;
  ma_ngoai_ngu: string | null;
}

export const numberOfStudentByLevel = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subject } = req.params;
    if (!subject) {
      res.status(400).json({ message: "Subject is required." });
      return;
    }

    // Validate subject exists in Student model
    const validSubjects = [
      "toan",
      "ngu_van",
      "ngoai_ngu",
      "vat_li",
      "hoa_hoc",
      "sinh_hoc",
      "lich_su",
      "dia_li",
      "gdcd",
    ];
    if (!validSubjects.includes(subject)) {
      res.status(400).json({ message: "Invalid subject." });
      return;
    }

    // Count students grouped by score ranges
    const ranges = [
      { label: "<4", min: -Infinity, max: 4 },
      { label: ">=4 and <6", min: 4, max: 6 },
      { label: ">=6 and <8", min: 6, max: 8 },
      { label: ">=8", min: 8, max: 10 },
    ];

    const counts = await Promise.all(
      ranges.map(async (range) => {
        const where: any = {};
        if (range.min !== -Infinity) where[subject] = { [Op.gte]: range.min };
        if (range.max !== 10) {
          where[subject] = {
            ...(where[subject] || {}),
            [Op.lt]: range.max,
          };
        }
        return {
          label: range.label,
          count: await Student.count({ where }),
        };
      })
    );
    res.json({ counts });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error.",
      error: (error as Error).message,
    });
  }
};
