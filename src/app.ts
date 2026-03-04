/* Entry point for the main program */
import { initializeJobs } from "./scheduler/jobs.js";
import express from "express";
import { registerRoutes } from "./api/routes.js";
import {loadEnvVars} from "./config/env.js"

loadEnvVars();

// initialize scheduler jobs
// await initializeJobs();

// await latestFiling("RRGB", "10-K").then(console.log);

const app = express();

registerRoutes(app);

app.listen("8080", () => {
  console.log("listening");
});
