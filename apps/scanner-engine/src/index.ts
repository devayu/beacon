import { ScannerEngineApp } from "./app";

async function main() {
  const app = new ScannerEngineApp();

  try {
    await app.start();
  } catch (error) {
    console.error("Failed to start Scanner Engine:", error);
    process.exit(1);
  }
}

// Run the application
main();
