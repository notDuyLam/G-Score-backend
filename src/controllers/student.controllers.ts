import { Request, Response } from "express";
import { Student } from "../models/student.model";
import { Op, Sequelize } from "sequelize";
import { parse } from "csv-parse/sync";

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

function parseNullableFloat(value: string): number | null {
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

export const importStudentCsv = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const csvContent = req.file.buffer.toString("utf-8").replace(/^\uFEFF/, "");
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      quote: '"',
      ltrim: true,
      rtrim: true,
    });

    console.log("First row columns:", Object.keys(records[0])); // Debug: see actual column names

    for (const row of records) {
      // Try multiple possible column names for sbd
      const sbd = (row["sbd"] || "").toString().trim();

      if (!sbd) {
        console.warn("⚠️ Missing or empty sbd in row:", row);
        continue;
      }

      console.log("✅ Processing student with sbd:", sbd); // Debug log

      await Student.upsert({
        sbd: row["sbd"],
        toan: parseNullableFloat(row["toan"]) ?? undefined,
        ngu_van: parseNullableFloat(row["ngu_van"]) ?? undefined,
        ngoai_ngu: parseNullableFloat(row["ngoai_ngu"]) ?? undefined,
        vat_li: parseNullableFloat(row["vat_li"]) ?? undefined,
        hoa_hoc: parseNullableFloat(row["hoa_hoc"]) ?? undefined,
        sinh_hoc: parseNullableFloat(row["sinh_hoc"]) ?? undefined,
        lich_su: parseNullableFloat(row["lich_su"]) ?? undefined,
        dia_li: parseNullableFloat(row["dia_li"]) ?? undefined,
        gdcd: parseNullableFloat(row["gdcd"]) ?? undefined,
        ma_ngoai_ngu: row["ma_ngoai_ngu"],
      });
    }

    return res.status(200).json({
      message: "Import successful",
      importedCount: records.length,
    });
  } catch (error: any) {
    console.error("CSV import error:", error);
    return res.status(500).json({
      error: "Import failed",
      details: error.message,
    });
  }
};
