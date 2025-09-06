import { logger } from "@beacon/logger";
import { UTApi } from "uploadthing/server";
import { readFileSync, unlinkSync } from "fs";
import { config } from "../config";
import { ScanResult } from "../types";
import { S } from "@upstash/qstash/client-CYwLcEcQ";

export class UploadThingStorageService {
  private utapi: UTApi;

  constructor() {
    if (!config.storage.uploadthingSecret) {
      throw new Error("UPLOADTHING_TOKEN must be provided");
    }

    this.utapi = new UTApi();
  }

  /**
   * Upload a file to UploadThing and return the public URL
   */
  async uploadScreenshot(filePath: string, fileName: string): Promise<string> {
    try {
      // Read the file
      const fileBuffer = readFileSync(filePath);

      logger.info(`Uploading screenshot to UploadThing: ${fileName}`);

      // Create File object from buffer
      const file = new File([fileBuffer], fileName, {
        type: "image/png",
      });

      // Upload to UploadThing
      const response = await this.utapi.uploadFiles([file]);

      if (!response[0] || response[0].error) {
        const errorMessage = response[0]?.error?.message || "Upload failed";
        logger.error("UploadThing upload error:", errorMessage);
        throw new Error(`Failed to upload screenshot: ${errorMessage}`);
      }

      const uploadedFile = response[0].data;
      if (!uploadedFile?.ufsUrl) {
        throw new Error("Failed to get public URL for uploaded screenshot");
      }

      logger.info(`Screenshot uploaded successfully: ${uploadedFile.ufsUrl}`);

      // Clean up local file after successful upload
      try {
        unlinkSync(filePath);
        logger.debug(`Local file cleaned up: ${filePath}`);
      } catch (cleanupError) {
        logger.warn(`Failed to cleanup local file: ${filePath}`, cleanupError);
      }

      return uploadedFile.ufsUrl;
    } catch (error) {
      logger.error("Failed to upload screenshot:", error);
      throw error;
    }
  }

  /**
   * Upload multiple screenshots and return their URLs
   */
  async uploadScreenshots(
    screenshots: {
      fileName: string;
      filePath: string;
      type: "original" | "violations";
    }[]
  ): Promise<{ original?: string; violations?: string }> {
    const results: { original?: string; violations?: string } = {};

    for (const screenshot of screenshots) {
      try {
        const url = await this.uploadScreenshot(
          screenshot.filePath,
          screenshot.fileName
        );
        results[screenshot.type] = url;
      } catch (error) {
        logger.error(`Failed to upload ${screenshot.type} screenshot:`, error);
        // Continue with other uploads even if one fails
      }
    }

    return results;
  }

  /**
   * Delete screenshots from UploadThing storage (optional cleanup)
   * Note: UploadThing files are automatically deleted after a certain period
   * or when storage limits are reached, so manual deletion may not be necessary
   */
  async deleteScreenshots(fileUrls: string[]): Promise<void> {
    try {
      // Extract file keys from URLs
      const fileKeys = fileUrls.map((url) => {
        const urlParts = url.split("/");
        return urlParts[urlParts.length - 1];
      });

      if (fileKeys.length > 0) {
        await this.utapi.deleteFiles(fileKeys);
        logger.info(`Screenshots deleted: ${fileKeys.join(", ")}`);
      }
    } catch (error) {
      logger.warn("Error deleting screenshots:", error);
    }
  }
}

// Singleton instance
let uploadThingStorageInstance: UploadThingStorageService | null = null;

export function getUploadThingStorage(): UploadThingStorageService {
  if (!uploadThingStorageInstance) {
    uploadThingStorageInstance = new UploadThingStorageService();
  }
  return uploadThingStorageInstance;
}
