/* Entry point for the main program */
import { latestFiling } from "./services/secApi.js";
import { initializeJobs } from "./scheduler/jobs.js";
import express from "express";
import { registerRoutes } from "./api/routes.js";

// initialize scheduler jobs
// await initializeJobs();

// await latestFiling("RRGB", "10-K").then(console.log);

const app = express();

registerRoutes(app);

app.listen("8080", () => {
  console.log("listening");
});
