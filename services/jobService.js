const axios = require("axios");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { queryDB, insertDB } = require("../database/database");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const validateStoreId = async (storeId) => {
  try {
    const storeData = fs.readFileSync("./store_master.csv", "utf-8");
    const stores = storeData
      .split("\n")
      .slice(1)
      .map((row) => row.split(",")[2].trim());
    console.log("Store IDs parsed successfully.");
    return stores.includes(storeId);
  } catch (error) {
    console.error("Error reading or parsing store_master.csv:", error.message);
    throw new Error("Failed to validate store_id.");
  }
};

// Submit a job
const submitJob = async (data) => {
  const { count, visits } = data;
  if (!count || !visits || count !== visits.length) {
    throw new Error("Count does not match visits.");
  }
  const jobId = uuidv4();
  await insertDB("INSERT INTO jobs (job_id, status) VALUES (?, ?)", [
    jobId,
    "ongoing",
  ]);
  for (const visit of visits) {
    const { store_id, image_url } = visit;
    const isValidStore = await validateStoreId(store_id);
    if (!isValidStore) {
      await insertDB("UPDATE jobs SET status = ? WHERE job_id = ?", [
        "failed",
        jobId,
      ]);
      throw new Error(`Invalid store_id: ${store_id}`);
    }
    for (const url of image_url) {
      try {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        const imageBuffer = Buffer.from(response.data);
        const imageSize = { width: 500, height: 300 };
        const perimeter = 2 * (imageSize.width + imageSize.height);
        const randomDelay = Math.random() * (400 - 100) + 100;
        await sleep(randomDelay);
        await insertDB(
          "INSERT INTO job_results (job_id, store_id, perimeter) VALUES (?, ?, ?)",
          [jobId, store_id, perimeter]
        );
      } catch (err) {
        await insertDB("UPDATE jobs SET status = ? WHERE job_id = ?", [
          "failed",
          jobId,
        ]);
        throw new Error(`Image download failed for store_id: ${store_id}`);
      }
    }
  }
  await insertDB("UPDATE jobs SET status = ? WHERE job_id = ?", [
    "completed",
    jobId,
  ]);
  return { job_id: jobId };
};

// Get job status
const getJobStatus = async (jobId) => {
  const job = await queryDB("SELECT status FROM jobs WHERE job_id = ?", [
    jobId,
  ]);

  if (!job) throw new Error("Job ID not found.");

  const status = job.status;
  if (status === "failed") {
    const errors = await queryDB(
      "SELECT store_id FROM job_results WHERE job_id = ? AND status = 'failed'",
      [jobId]
    );
    return { status, job_id: jobId, error: errors };
  }
  return { status, job_id: jobId };
};

module.exports = { submitJob, getJobStatus };
