const express = require("express");
const router = express.Router();
const { submitJob, getJobStatus } = require("../services/jobService");

// Submit Job
router.post("/submit", async (req, res) => {
  try {
    const response = await submitJob(req.body);
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Job Status
router.get("/status", async (req, res) => {
  const jobId = req.query.jobid;
  if (!jobId) return res.status(400).json({});
  try {
    const response = await getJobStatus(jobId);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({});
  }
});

module.exports = router;
