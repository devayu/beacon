import { connectDB, disconnectDB, prisma } from "@beacon/db";
import { logger } from "@beacon/logger";

// Auto-initialize database connection when module loads (server-side only)
// if (typeof window === "undefined") {
//   connectDB()
//     .then(() => {
//       logger.info("Database connection established in web app");
//     })
//     .catch((error) => {
//       logger.error("Failed to connect to database in web app:", error);
//     });

//   // Graceful shutdown handlers
//   process.on("SIGTERM", async () => {
//     try {
//       await disconnectDB();
//       logger.info("Database connection closed gracefully");
//     } catch (error) {
//       logger.error("Error closing database connection:", error);
//     }
//   });

//   process.on("SIGINT", async () => {
//     try {
//       await disconnectDB();
//       logger.info("Database connection closed gracefully");
//     } catch (error) {
//       logger.error("Error closing database connection:", error);
//     }
//   });
// }

export { prisma };

// Export types for use in the web app
export type * from "@beacon/db";
