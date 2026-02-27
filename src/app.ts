/* Entry point for the main program */
import { latestFiling } from "./services/secApi.js";
import { initializeJobs } from "./scheduler/jobs.js";

// initialize scheduler jobs
// await initializeJobs();

await latestFiling("RRGB", "10-K").then(console.log);
