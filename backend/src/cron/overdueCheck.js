import cron from "node-cron";
import { checkOverdueBooks } from "../controllers/borrowController.js";

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const req = {};
    const res = {
      json: () => {},
      status: () => ({ json: () => {} }),
    };
    await checkOverdueBooks(req, res);
  } catch (error) {}
});
