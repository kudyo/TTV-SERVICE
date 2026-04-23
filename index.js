import express from "express";

const app = express();
app.use(express.json());

app.post("/enqueue", (req, res) => {
  const jobId = "job_" + Date.now();

  console.log("Received:", req.body);

  res.json({
    workerJobId: jobId,
    status: "queued"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on port", PORT));
