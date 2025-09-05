import { Page } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { AccessibilityViolation } from "../types";

export class ScreenshotManager {
  async takeScreenshots(
    page: Page,
    jobId: string,
    outputDir: string,
    violations: AccessibilityViolation[],
    possibleViolations: AccessibilityViolation[],
    highlightViolations: boolean
  ): Promise<void> {
    console.log("saving screenshots", jobId);
    const screenshotDir = path.join(outputDir, "screenshots");
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    // Take regular screenshot first
    const screenshotPath = path.join(screenshotDir, `${jobId}.png`);
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
        `${jobId}_violations.png`
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
          position: relative !important;
        }
        .axe-possible-violation-highlight {
          outline: 3px solid #ffaa00 !important;
          outline-offset: 2px !important;
          background-color: rgba(255, 170, 0, 0.1) !important;
          position: relative !important;
        }
        .axe-violation-label {
          position: absolute !important;
          top: -25px !important;
          left: 0 !important;
          background: #ff0000 !important;
          color: white !important;
          padding: 3px 8px !important;
          font-size: 12px !important;
          font-family: monospace !important;
          font-weight: bold !important;
          border-radius: 4px !important;
          white-space: nowrap !important;
          z-index: 10000 !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
          border: 2px solid #ffffff !important;
        }
        .axe-possible-violation-label {
          position: absolute !important;
          top: -25px !important;
          left: 0 !important;
          background: #ffaa00 !important;
          color: white !important;
          padding: 3px 8px !important;
          font-size: 12px !important;
          font-family: monospace !important;
          font-weight: bold !important;
          border-radius: 4px !important;
          white-space: nowrap !important;
          z-index: 10000 !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
          border: 2px solid #ffffff !important;
        }
      `;
        document.head.appendChild(style);

        possibleViolations.forEach((violation) => {
          violation.nodes.forEach((node: any) => {
            node.target.forEach((selector: string) => {
              try {
                const elements = document.querySelectorAll(selector);
                elements.forEach((element: Element) => {
                  const htmlElement = element as HTMLElement;
                  htmlElement.classList.add("axe-possible-violation-highlight");

                  // Add violation ID label
                  const label = document.createElement("div");
                  label.className = "axe-possible-violation-label";
                  label.textContent = violation.id;
                  htmlElement.appendChild(label);
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
          console.log("Processing violation:", violation.id, violation.nodes);
          violation.nodes.forEach((node: any) => {
            node.target.forEach((selector: string) => {
              try {
                const elements = document.querySelectorAll(selector);
                elements.forEach((element: Element) => {
                  const htmlElement = element as HTMLElement;
                  htmlElement.classList.add("axe-violation-highlight");

                  // Add violation ID label
                  const label = document.createElement("div");
                  label.className = "axe-violation-label";
                  label.textContent = violation.id;
                  htmlElement.appendChild(label);
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
