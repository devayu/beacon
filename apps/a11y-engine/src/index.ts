import { A11yEngineApp } from "./app";

async function main() {
  const app = new A11yEngineApp();
  
  try {
    await app.start();
  } catch (error) {
    console.error("Failed to start A11y Engine:", error);
    process.exit(1);
  }
}

// Run the application
main();