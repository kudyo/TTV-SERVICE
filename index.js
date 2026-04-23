import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Endpoint na tatanggap ng jobs mula sa Back4App
app.post("/enqueue", async (req, res) => {
  const { jobId, sourceFileUrl, sourceFileName } = req.body;
  console.log("Received job:", jobId, sourceFileName);

  // Sample scenes payload (pwede mong palitan ng cinematic logic mo)
  const payload = {
    jobId,
    jobType: "scenes",
    storyId: "neoFuture001",
    style: "anime_futuristic_cinematic_animatic",
    meta: { author: "Joel", createdAt: new Date().toISOString(), version: "3.0" },
    scenes: [
      {
        id: "scene1",
        title: "Skyline Awakens",
        description: "Drone shot of neon skyscrapers",
        assets: { imagePrompt: "futuristic skyline", audioPrompt: "ambient synthwave" },
        duration: 10
      }
    ],
    output: { finalVideo: "neoFutureMovie.mp4" }
  };

  try {
    await sendScenesToBack4App(payload);
    res.json({ ok: true, workerJobId: "worker123" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Worker failed");
  }
});

app.listen(PORT, () => console.log(`Worker running on port ${PORT}`));

// Function to send scenes back to Back4App
async function sendScenesToBack4App(payload) {
  const WORKER_SHARED_SECRET = process.env.WORKER_SHARED_SECRET;
  const APP_ID = process.env.APP_ID;
  const REST_API_KEY = process.env.REST_API_KEY;

  const body = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", WORKER_SHARED_SECRET).update(body).digest("hex");

  const resp = await fetch("https://parseapi.back4app.com/functions/workerUpsertScenes", {
    method: "POST",
    headers: {
      "X-Parse-Application-Id": APP_ID,
      "X-Parse-REST-API-Key": REST_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ signature, payload })
  });

  if (!resp.ok) throw new Error(await resp.text());
  return await resp.json();
}
