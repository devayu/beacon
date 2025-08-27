import { AccessibilityScanner } from "./scanner";

// Example usage with the new structure
async function main() {
  const scanner = new AccessibilityScanner();
  
  try {
    // Scan with smart dark mode detection
    const result = await scanner.scanWithSmartDarkMode("http://localhost:3001/");
    
    console.log(result);
    scanner.printSummary([result]);
    
    // Generate and save report
    const report = scanner.generateReport([result], "./accessibility-reports/report.json");
    console.log("\n📊 Report generated:", report.summary);
    
  } catch (error) {
    console.error("❌ Scan failed:", error);
  }
}

// Run the scanner
main();
