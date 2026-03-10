import cron from "node-cron";
import { checkOverdueBooks } from "../controllers/borrowController.js";

// Run every day at midnight
cron.schedule("* * * * *", async () => {
  console.log("Running overdue books check...");
  try {
    const req = {};
    const res = {
      json: (data) => console.log("Overdue check result:", data),
      status: (code) => ({
        json: (data) => console.log(`Status ${code}:`, data),
      }),
    };
    await checkOverdueBooks(req, res);
  } catch (error) {
    console.error("Cron job error:", error);
  }
});
