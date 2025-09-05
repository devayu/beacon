import * as fs from "fs";
import * as path from "path";
import { ScanResult, Report } from "../types";

export class ReportManager {
  generateReport(results: ScanResult[], outputPath?: string): Report {
    const report: Report = {
      summary: {
        totalUrls: results.length,
        totalViolations: results.reduce((sum, r) => sum + r.violations.length, 0),
        criticalViolations: results.reduce(
          (sum, r) =>
            sum + r.violations.filter((v) => v.impact === "critical").length,
          0
        ),
        seriousViolations: results.reduce(
          (sum, r) =>
            sum + r.violations.filter((v) => v.impact === "serious").length,
          0
        ),
        averageViolationsPerPage:
          results.length > 0
            ? (
                results.reduce((sum, r) => sum + r.violations.length, 0) /
                results.length
              ).toFixed(2)
            : 0,
        scanTimestamp: new Date().toISOString(),
      },
      results,
    };

    if (outputPath) {
      this.saveReport(report, outputPath);
    }

    return report;
  }

  private saveReport(report: Report, outputPath: string): void {
    const reportJson = JSON.stringify(report, null, 2);
    const dir = path.dirname(outputPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, reportJson);
    console.log(`📄 Report saved to: ${outputPath}`);
  }

  printSummary(results: ScanResult[]): void {
    console.log("\n📊 ACCESSIBILITY SCAN SUMMARY");
    console.log("================================");

    results.forEach((result, index) => {
      const { url, violations } = result;
      const criticalCount = violations.filter(
        (v) => v.impact === "critical"
      ).length;
      const seriousCount = violations.filter(
        (v) => v.impact === "serious"
      ).length;

      console.log(`\n${index + 1}. ${url}`);
      console.log(`   Total violations: ${violations.length}`);
      if (criticalCount > 0) console.log(`   🔴 Critical: ${criticalCount}`);
      if (seriousCount > 0) console.log(`   🟠 Serious: ${seriousCount}`);
      if (violations.length === 0) console.log("   ✅ No violations found!");
    });

    const totalViolations = results.reduce(
      (sum, r) => sum + r.violations.length,
      0
    );
    const totalCritical = results.reduce(
      (sum, r) =>
        sum + r.violations.filter((v) => v.impact === "critical").length,
      0
    );

    console.log(
      `\n🎯 OVERALL: ${totalViolations} total violations (${totalCritical} critical)`
    );
  }
}