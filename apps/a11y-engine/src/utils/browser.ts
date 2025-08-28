import { chromium, Browser, BrowserContext, Page } from "playwright";
import { ScanOptions } from "../types";

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  async createBrowser(
    options: ScanOptions
  ): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
    this.browser = await chromium.launch({ headless: true });

    this.context = await this.browser.newContext({
      colorScheme: options.colorScheme || "dark",
      reducedMotion: options.reducedMotion || "no-preference",
    });

    const page = await this.context.newPage();

    // Forward browser console logs to Node.js console for debugging
    page.on("console", (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (
        text.includes("Debug:") ||
        text.includes("violation") ||
        text.includes("highlight")
      ) {
        console.log(`[BROWSER ${type.toUpperCase()}] ${text}`);
      }
    });

    return { browser: this.browser, context: this.context, page };
  }

  async setupPage(
    page: Page,
    context: BrowserContext,
    url: string,
    options: ScanOptions
  ): Promise<void> {
    const {
      viewport = { width: 1920, height: 1080 },
      userAgent,
      timeout = 60000,
      waitUntil = "domcontentloaded",
    } = options;

    // Set viewport and user agent
    await page.setViewportSize(viewport);
    if (userAgent) {
      await page.setExtraHTTPHeaders({ "User-Agent": userAgent });
    }

    // Add cookies if provided
    if (options.cookies && options.cookies.length > 0) {
      await context.addCookies(
        options.cookies.map((cookie) => ({
          ...cookie,
          url: url,
        }))
      );
    }

    console.log(`[INFO] Scanning: ${url}`);
    await page.goto(url, { waitUntil, timeout });

    // Set localStorage after page load if provided
    if (options.localStorage) {
      await page.evaluate((storage) => {
        Object.entries(storage).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
      }, options.localStorage);
      // Reload to apply localStorage changes
      await page.reload({ waitUntil, timeout });
    }

    // Wait for dynamic content to load
    await page.waitForTimeout(1000);
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
    }
  }
}
