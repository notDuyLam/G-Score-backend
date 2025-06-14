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

    if (records.length === 0) {
      return res.status(400).json({ error: "No valid records found in CSV" });
    }

    // Pre-compile regex and optimize string operations
    const cleanValue = (val: string | null | undefined): string | null => {
      if (!val || val === "") return null;
      return val.toString().trim() || null;
    };

    // Batch process data transformation
    const validRecords: StudentRecord[] = [];
    const PROCESS_BATCH_SIZE = 10000; // Process in larger chunks

    for (let i = 0; i < records.length; i += PROCESS_BATCH_SIZE) {
      const chunk = records.slice(i, i + PROCESS_BATCH_SIZE);

      const processedChunk = chunk
        .map((row: any): StudentRecord | null => {
          const sbd = cleanValue(row["sbd"] || row["'sbd'"]);
          if (!sbd) return null;

          return {
            sbd,
            toan:
              parseNullableFloat(cleanValue(row["toan"] || row["'toan'"])) ??
              null,
            ngu_van:
              parseNullableFloat(
                cleanValue(row["ngu_van"] || row["'ngu_van'"])
              ) ?? null,
            ngoai_ngu:
              parseNullableFloat(
                cleanValue(row["ngoai_ngu"] || row["'ngoai_ngu'"])
              ) ?? null,
            vat_li:
              parseNullableFloat(
                cleanValue(row["vat_li"] || row["'vat_li'"])
              ) ?? null,
            hoa_hoc:
              parseNullableFloat(
                cleanValue(row["hoa_hoc"] || row["'hoa_hoc'"])
              ) ?? null,
            sinh_hoc:
              parseNullableFloat(
                cleanValue(row["sinh_hoc"] || row["'sinh_hoc'"])
              ) ?? null,
            lich_su:
              parseNullableFloat(
                cleanValue(row["lich_su"] || row["'lich_su'"])
              ) ?? null,
            dia_li:
              parseNullableFloat(
                cleanValue(row["dia_li"] || row["'dia_li'"])
              ) ?? null,
            gdcd:
              parseNullableFloat(cleanValue(row["gdcd"] || row["'gdcd'"])) ??
              null,
            ma_ngoai_ngu: cleanValue(
              row["ma_ngoai_ngu"] || row["'ma_ngoai_ngu'"]
            ),
          };
        })
        .filter(
          (item: StudentRecord | null): item is StudentRecord => item !== null
        );

      validRecords.push(...processedChunk);
    }

    // Optimize SQL generation
    const BATCH_SIZE = 5000; // Larger batch size
    let processedCount = 0;

    // Pre-compile helper functions
    const escapeString = (val: string | null): string =>
      val ? `'${val.replace(/'/g, "''")}'` : "NULL";
    const formatNumber = (val: number | null): string =>
      val !== null ? val.toString() : "NULL";

    // Process in batches without excessive logging
    const totalBatches = Math.ceil(validRecords.length / BATCH_SIZE);

    for (let i = 0; i < validRecords.length; i += BATCH_SIZE) {
      const batch = validRecords.slice(i, i + BATCH_SIZE);
      const currentBatch = Math.floor(i / BATCH_SIZE) + 1;

      // Build VALUES clause more efficiently
      const valueStrings: string[] = [];
      for (const record of batch) {
        valueStrings.push(
          `('${record.sbd}', ${formatNumber(record.toan)}, ${formatNumber(
            record.ngu_van
          )}, ${formatNumber(record.ngoai_ngu)}, ${formatNumber(
            record.vat_li
          )}, ${formatNumber(record.hoa_hoc)}, ${formatNumber(
            record.sinh_hoc
          )}, ${formatNumber(record.lich_su)}, ${formatNumber(
            record.dia_li
          )}, ${formatNumber(record.gdcd)}, ${escapeString(
            record.ma_ngoai_ngu
          )})`
        );
      }

      const sql = `
        INSERT INTO "Student" (sbd, toan, ngu_van, ngoai_ngu, vat_li, hoa_hoc, sinh_hoc, lich_su, dia_li, gdcd, ma_ngoai_ngu)
        VALUES ${valueStrings.join(",")}
        ON CONFLICT (sbd) DO UPDATE SET
          toan = EXCLUDED.toan,
          ngu_van = EXCLUDED.ngu_van,
          ngoai_ngu = EXCLUDED.ngoai_ngu,
          vat_li = EXCLUDED.vat_li,
          hoa_hoc = EXCLUDED.hoa_hoc,
          sinh_hoc = EXCLUDED.sinh_hoc,
          lich_su = EXCLUDED.lich_su,
          dia_li = EXCLUDED.dia_li,
          gdcd = EXCLUDED.gdcd,
          ma_ngoai_ngu = EXCLUDED.ma_ngoai_ngu
      `;

      await sequelize.query(sql);
      processedCount += batch.length;

      // Only log every 10 batches or on completion
      if (currentBatch % 10 === 0 || currentBatch === totalBatches) {
        console.log(
          `Batch ${currentBatch}/${totalBatches} - Processed ${processedCount}/${validRecords.length} records`
        );
      }
    }

    return res.status(200).json({
      message: "Import successful",
      importedCount: processedCount,
      totalRecords: records.length,
      skippedRecords: records.length - processedCount,
    });
  } catch (error: any) {
    console.error("CSV import error:", error);
    return res.status(500).json({
      error: "Import failed",
      details: error.message,
    });
  }
};
