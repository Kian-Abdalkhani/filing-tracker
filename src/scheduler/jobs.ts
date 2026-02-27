import cron from "node-cron";

import { updateTickerRef } from "../services/secApi.js";

export async function initializeJobs() {
  // Update local ticker reference on the first of every month
  cron.schedule("0 0 1 * *", async () => {
    try {
      await updateTickerRef();
    } catch (err) {
      console.error(err);
    } finally {
      console.log("Successfully updated ticker reference!");
    }
  });

  console.log("scheduler successfully initalized");
}
