import { Page } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { AccessibilityViolation } from "../types";

export class ScreenshotManager {
  async takeScreenshots(
    page: Page,
    url: string,
    outputDir: string,
    violations: AccessibilityViolation[],
    possibleViolations: AccessibilityViolation[],
    highlightViolations: boolean
  ): Promise<void> {
    const screenshotDir = path.join(outputDir, "screenshots");
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const sanitizedUrl = url.replace(/[^a-zA-Z0-9]/g, "_");

    // Take regular screenshot first
    const screenshotPath = path.join(screenshotDir, `${sanitizedUrl}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);

    // Take highlighted screenshot if there are violations and option is enabled
    if (
      highlightViolations &&
      (violations.length > 0 || possibleViolations.length > 0)
    ) {
      await this.highlightViolatedElements(
        page,
        violations,
        possibleViolations
      );
      const highlightedPath = path.join(
        screenshotDir,
        `${sanitizedUrl}_violations.png`
      );
      await page.screenshot({ path: highlightedPath, fullPage: true });
      console.log(`🔴 Violations screenshot saved: ${highlightedPath}`);
    }
  }

  private async highlightViolatedElements(
    page: Page,
    violations: AccessibilityViolation[],
    possibleViolations: AccessibilityViolation[] = []
  ): Promise<void> {
    await page.evaluate(
      ({ violations, possibleViolations }) => {
        const style = document.createElement("style");
        style.textContent = `
         .axe-violation-highlight {
          outline: 3px solid #ff0000 !important;
          outline-offset: 2px !important;
          background-color: rgba(255, 0, 0, 0.1) !important;
        }
        .axe-possible-violation-highlight {
          outline: 3px solid #ffaa00 !important;
          outline-offset: 2px !important;
          background-color: rgba(255, 170, 0, 0.1) !important;
        }
      `;
        document.head.appendChild(style);

        possibleViolations.forEach((violation) => {
          violation.nodes.forEach((node: any) => {
            node.target.forEach((selector: string) => {
              try {
                const elements = document.querySelectorAll(selector);
                elements.forEach((element: Element) => {
                  (element as HTMLElement).classList.add(
                    "axe-possible-violation-highlight"
                  );
                });
              } catch (error) {
                console.warn(
                  "Could not highlight possible violation with selector:",
                  selector
                );
              }
            });
          });
        });

        violations.forEach((violation) => {
          violation.nodes.forEach((node: any) => {
            node.target.forEach((selector: string) => {
              try {
                const elements = document.querySelectorAll(selector);
                elements.forEach((element: Element) => {
                  (element as HTMLElement).classList.add(
                    "axe-violation-highlight"
                  );
                });
              } catch (error) {
                console.warn(
                  "Could not highlight element with selector:",
                  selector
                );
              }
            });
          });
        });
      },
      { violations, possibleViolations }
    );
  }
}
