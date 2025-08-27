import { chromium } from "playwright";
import { DarkModeInfo, ScanOptions } from "../types";

export class DarkModeDetector {
  async detectDarkModeMethod(url: string): Promise<DarkModeInfo> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      await page.goto(url);

      const darkModeInfo = await page.evaluate(() => {
        const methods: DarkModeInfo = {
          cssMediaQuery: window.matchMedia("(prefers-color-scheme: dark)")
            .matches,
          localStorage: Object.keys(localStorage).filter(
            (key) =>
              key.toLowerCase().includes("theme") ||
              key.toLowerCase().includes("dark") ||
              key.toLowerCase().includes("mode")
          ),
          cookies: document.cookie
            .split(";")
            .filter(
              (cookie) =>
                cookie.toLowerCase().includes("theme") ||
                cookie.toLowerCase().includes("dark") ||
                cookie.toLowerCase().includes("mode")
            ),
          dataAttributes: Array.from(
            document.querySelectorAll("[data-theme], [data-dark], [data-mode]")
          ).map((el) => ({
            tag: el.tagName,
            attribute:
              el.getAttribute("data-theme") ||
              el.getAttribute("data-dark") ||
              el.getAttribute("data-mode"),
          })),
          bodyClasses: Array.from(document.body.classList).filter(
            (cls) => cls.includes("dark") || cls.includes("theme")
          ),
          htmlClasses: Array.from(document.documentElement.classList).filter(
            (cls) => cls.includes("dark") || cls.includes("theme")
          ),
        };

        return methods;
      });

      await browser.close();
      return darkModeInfo;
    } catch (error) {
      await browser.close();
      throw error;
    }
  }

  buildSmartDarkModeOptions(
    darkModeInfo: DarkModeInfo, 
    baseOptions: ScanOptions
  ): ScanOptions {
    const smartOptions: ScanOptions = { ...baseOptions };

    // Always try CSS media query first
    smartOptions.colorScheme = "dark";

    // Add localStorage settings if detected
    if (darkModeInfo.localStorage.length > 0) {
      smartOptions.localStorage = {
        ...smartOptions.localStorage,
        theme: "dark",
        darkMode: "true",
        "dark-mode": "enabled",
        "color-scheme": "dark",
      };
    }

    // Add cookie settings if detected
    if (darkModeInfo.cookies.length > 0) {
      smartOptions.cookies = [
        ...(smartOptions.cookies || []),
        { name: "theme", value: "dark" },
        { name: "darkMode", value: "enabled" },
        { name: "dark-mode", value: "true" },
      ];
    }

    return smartOptions;
  }
}