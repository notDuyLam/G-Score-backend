"use strict";

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

/**
 * Helper to parse float or null
 */
const parseNullableFloat = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("Starting CSV data import seeding...");

    const csvPath = path.join(__dirname, "../assets/diem_thi_thpt_2024.csv");

    console.log("Reading CSV file from:", csvPath);

    // Check if file exists
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at: ${csvPath}`);
    }

    const fileStats = fs.statSync(csvPath);
    console.log(
      `📊 File size: ${(fileStats.size / 1024 / 1024).toFixed(2)} MB`
    );

    console.log("📖 Reading file content...");
    const readStartTime = Date.now();
    const fileContent = fs.readFileSync(csvPath, "utf-8");
    const readEndTime = Date.now();
    console.log(`File read completed in ${readEndTime - readStartTime}ms`);

    console.log("Parsing CSV data...");
    const parseStartTime = Date.now();

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const parseEndTime = Date.now();
    console.log(`CSV parsing completed in ${parseEndTime - parseStartTime}ms`);
    console.log(`Found ${records.length} records in CSV`);

    // Show first few column names for verification
    if (records.length > 0) {
      console.log("CSV columns:", Object.keys(records[0]));
    }

    console.log("Transforming data...");
    const transformStartTime = Date.now();

    let validCount = 0;
    let invalidCount = 0;
    let groupACount = 0;
    let groupBCount = 0;

    const students = records
      .map((row, index) => {
        // Log progress every 10,000 records
        if ((index + 1) % 10000 === 0) {
          console.log(
            `Processed ${index + 1}/${records.length} records (${(
              ((index + 1) / records.length) *
              100
            ).toFixed(1)}%)`
          );
        }

        const student = {
          sbd: row.sbd,
          toan: parseNullableFloat(row.toan),
          ngu_van: parseNullableFloat(row.ngu_van),
          ngoai_ngu: parseNullableFloat(row.ngoai_ngu),
          vat_li: parseNullableFloat(row.vat_li),
          hoa_hoc: parseNullableFloat(row.hoa_hoc),
          sinh_hoc: parseNullableFloat(row.sinh_hoc),
          lich_su: parseNullableFloat(row.lich_su),
          dia_li: parseNullableFloat(row.dia_li),
          gdcd: parseNullableFloat(row.gdcd),
          ma_ngoai_ngu: row.ma_ngoai_ngu || null,
        };

        // Validate and count
        if (student.sbd) {
          validCount++;

          // Determine group (simplified logic)
          const hasScience =
            student.vat_li !== null ||
            student.hoa_hoc !== null ||
            student.sinh_hoc !== null;
          const hasSocial =
            student.lich_su !== null ||
            student.dia_li !== null ||
            student.gdcd !== null;

          if (hasScience && !hasSocial) groupACount++;
          else if (!hasScience && hasSocial) groupBCount++;
        } else {
          invalidCount++;
          console.warn(`Invalid record at row ${index + 1}: missing sbd`);
        }

        return student;
      })
      .filter((student) => student.sbd); // Remove invalid records

    const transformEndTime = Date.now();
    console.log(
      `Data transformation completed in ${
        transformEndTime - transformStartTime
      }ms`
    );

    console.log("Data analysis:");
    console.log(`   - Total records processed: ${records.length}`);
    console.log(`   - Valid records: ${validCount}`);
    console.log(`   - Invalid records: ${invalidCount}`);
    console.log(`   - Group A (Science focus): ${groupACount}`);
    console.log(`   - Group B (Social focus): ${groupBCount}`);
    console.log(`   - Mixed/Other: ${validCount - groupACount - groupBCount}`);

    // Insert in batches for better performance
    const batchSize = 10000;
    const totalBatches = Math.ceil(students.length / batchSize);

    console.log(`Starting database insertion...`);
    console.log(
      `📦 Processing ${totalBatches} batches of ${batchSize} records each`
    );

    const insertStartTime = Date.now();
    let totalInserted = 0;

    for (let i = 0; i < students.length; i += batchSize) {
      const batchNumber = Math.floor(i / batchSize) + 1;
      const batch = students.slice(i, i + batchSize);

      const batchStartTime = Date.now();

      console.log(
        `Inserting batch ${batchNumber}/${totalBatches} (${batch.length} records)...`
      );

      try {
        await queryInterface.bulkInsert("Student", batch, {});

        const batchEndTime = Date.now();
        const batchDuration = batchEndTime - batchStartTime;
        const recordsPerSecond = Math.round(
          batch.length / (batchDuration / 1000)
        );

        totalInserted += batch.length;

        console.log(
          `Batch ${batchNumber}/${totalBatches} completed in ${batchDuration}ms (${recordsPerSecond} records/sec)`
        );

        // Show overall progress
        const overallProgress = (
          (totalInserted / students.length) *
          100
        ).toFixed(1);
        console.log(
          `Overall progress: ${totalInserted}/${students.length} (${overallProgress}%)`
        );
      } catch (error) {
        console.error(`Error in batch ${batchNumber}:`, error.message);
        throw error;
      }
    }

    const insertEndTime = Date.now();
    const totalDuration = insertEndTime - insertStartTime;
    const averageRecordsPerSecond = Math.round(
      totalInserted / (totalDuration / 1000)
    );

    console.log(`🎉 CSV import seeding completed successfully!`);
    console.log(
      `Total insertion time: ${(totalDuration / 1000).toFixed(2)} seconds`
    );
    console.log(
      `Average insertion speed: ${averageRecordsPerSecond} records/second`
    );
    console.log(`Total records inserted: ${totalInserted}`);

    // Show sample of inserted data
    console.log(`Sample of inserted records:`);
    students.slice(0, 3).forEach((student, index) => {
      const subjects = [];
      if (student.toan !== null) subjects.push(`Math: ${student.toan}`);
      if (student.vat_li !== null) subjects.push(`Physics: ${student.vat_li}`);
      if (student.lich_su !== null)
        subjects.push(`History: ${student.lich_su}`);

      console.log(
        `   ${index + 1}. SBD: ${student.sbd} - ${subjects
          .slice(0, 2)
          .join(", ")}`
      );
    });
  },

  async down(queryInterface, Sequelize) {
    console.log("🧹 Starting cleanup of CSV imported data...");

    try {
      const deleteStartTime = Date.now();

      // Get count before deletion
      console.log("Counting records to delete...");
      const countResult = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM "Student"',
        { type: Sequelize.QueryTypes.SELECT }
      );

      const recordCount = countResult[0].count;
      console.log(`Found ${recordCount} records to delete`);

      console.log("Deleting all student records...");
      await queryInterface.bulkDelete("Student", null, {});

      const deleteEndTime = Date.now();
      const deleteDuration = deleteEndTime - deleteStartTime;

      console.log(`Cleanup completed successfully!`);
      console.log(
        `Deletion completed in ${(deleteDuration / 1000).toFixed(2)} seconds`
      );
      console.log(`Deleted ${recordCount} records`);
    } catch (error) {
      console.error("Error during cleanup:", error.message);
      throw error;
    }
  },
};
