import { AxeBuilder } from "@axe-core/playwright";
import { ScanOptions, ScanResult, AccessibilityViolation } from "../types";
import { BrowserManager } from "../utils/browser";
import { ScreenshotManager } from "../utils/screenshot";
import { ReportManager } from "../utils/report";
import { DarkModeDetector } from "../utils/darkMode";

export class AccessibilityScanner {
  private browserManager: BrowserManager;
  private screenshotManager: ScreenshotManager;
  private reportManager: ReportManager;
  private darkModeDetector: DarkModeDetector;

  constructor() {
    this.browserManager = new BrowserManager();
    this.screenshotManager = new ScreenshotManager();
    this.reportManager = new ReportManager();
    this.darkModeDetector = new DarkModeDetector();
  }

  async scan(url: string, options: ScanOptions = {}): Promise<ScanResult> {
    const {
      timeout = 60000,
      waitUntil = "domcontentloaded",
      includeSelectors = [],
      excludeSelectors = [],
      disableRules = [],
      tags = [
        "wcag2a",
        "wcag2aa",
        "wcag21aa",
        "best-practice",
        "wcag22aa",
        "wcag2aaa",
      ],
      screenshot = true,
      highlightViolations = true,
      outputDir = "./accessibility-reports",
    } = options;

    const { context, page } = await this.browserManager.createBrowser(options);

    try {
      await this.browserManager.setupPage(page, context, url, options);

      const axeBuilder = new AxeBuilder({ page });

      if (disableRules.length > 0) {
        axeBuilder.disableRules(disableRules);
      }

      axeBuilder.withTags(tags);

      if (includeSelectors.length > 0 || excludeSelectors.length > 0) {
        if (includeSelectors.length > 0) {
          axeBuilder.include(includeSelectors);
        }
        if (excludeSelectors.length > 0) {
          axeBuilder.exclude(excludeSelectors);
        }
      }

      const results = await axeBuilder.analyze();

      if (screenshot) {
        const violations = this.normalizeViolations(results.violations);
        const possibleViolations =
          results.incomplete as AccessibilityViolation[];

        await this.screenshotManager.takeScreenshots(
          page,
          url,
          outputDir,
          violations,
          possibleViolations,
          highlightViolations
        );
      }

      const userAgentString = await page.evaluate(() => navigator.userAgent);
      const viewport = options.viewport || { width: 1920, height: 1080 };

      const scanResult: ScanResult = {
        url,
        timestamp: new Date().toISOString(),
        violations: this.normalizeViolations(results.violations),
        possibleViolations: results.incomplete as AccessibilityViolation[],
        passes: results.passes.length,
        incomplete: results.incomplete.length,
        inapplicable: results.inapplicable.length,
        testEnvironment: {
          userAgent: userAgentString,
          viewport,
        },
      };

      return scanResult;
    } finally {
      await this.browserManager.closeBrowser();
    }
  }

  async scanMultiple(
    urls: string[],
    options: ScanOptions = {}
  ): Promise<ScanResult[]> {
    const results: ScanResult[] = [];

    console.log(`🚀 Starting scan of ${urls.length} URLs`);

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`Progress: ${i + 1}/${urls.length}`);

      try {
        const result = await this.scan(url, options);
        results.push(result);
      } catch (error) {
        console.error(`❌ Failed to scan ${url}:`, error);
      }

      // Small delay between requests
      if (i < urls.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  async runScan(url: string, options: ScanOptions = {}): Promise<ScanResult> {
    console.log("🔍 Detecting dark mode implementation...");
    const darkModeInfo = await this.darkModeDetector.detectDarkModeMethod(url);

    console.log("Dark mode detection results:", darkModeInfo);

    const smartOptions = this.darkModeDetector.buildSmartDarkModeOptions(
      darkModeInfo,
      options
    );

    console.log("🌙 Running scan with smart dark mode detection...");
    return this.scan(url, smartOptions);
  }

  generateReport(results: ScanResult[], outputPath?: string) {
    return this.reportManager.generateReport(results, outputPath);
  }

  printSummary(results: ScanResult[]): void {
    this.reportManager.printSummary(results);
  }

  private normalizeViolations(violations: any[]): AccessibilityViolation[] {
    return violations.map((v: any) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map((n: any) => ({
        html: n.html,
        target: n.target,
        failureSummary: n.failureSummary,
      })),
    }));
  }
}

export async function scanMultipleUrls(
  urls: string[],
  options: ScanOptions = {}
): Promise<ScanResult[]> {
  const scanner = new AccessibilityScanner();
  return scanner.scanMultiple(urls, options);
}

export function generateReport(results: ScanResult[], outputPath?: string) {
  const reportManager = new ReportManager();
  return reportManager.generateReport(results, outputPath);
}

export function printSummary(results: ScanResult[]): void {
  const reportManager = new ReportManager();
  reportManager.printSummary(results);
}

export async function detectDarkModeMethod(url: string) {
  const detector = new DarkModeDetector();
  return detector.detectDarkModeMethod(url);
}

export * from "../types";
