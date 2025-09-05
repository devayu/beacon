import { AIEngineApp } from "./app";

async function main() {
  const app = new AIEngineApp();

  try {
    await app.start();
  } catch (error) {
    console.error("Failed to start AI Engine:", error);
    process.exit(1);
  }
}

main();
