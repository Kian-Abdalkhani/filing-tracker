/* Entry point for the main program */
import { latestFiling } from "./services/secApi.js";
import { initializeJobs } from "./scheduler/jobs.js";

// initialize scheduler jobs
// await initializeJobs();

const filing = await latestFiling("AAPL");

console.log(filing);
