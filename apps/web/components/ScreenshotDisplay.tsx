"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Image as ImageIcon, X, ZoomIn, ZoomOut } from "lucide-react";

interface ScreenshotDisplayProps {
  jobId: string;
}

export function ScreenshotDisplay({ jobId }: ScreenshotDisplayProps) {
  const [showScreenshot, setShowScreenshot] = useState(true);
  const [screenshotError, setScreenshotError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const screenshotUrl = `/api/screenshots/${jobId}`;

  const handleImageClick = () => {
    setIsZoomed(true);
  };

  const handleCloseZoom = () => {
    setIsZoomed(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsZoomed(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Highlighted Violations</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowScreenshot(!showScreenshot)}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          {showScreenshot ? "Hide" : "Show"} Screenshot
        </Button>
      </div>

      {showScreenshot && (
        <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700">
          {!screenshotError ? (
            <div className="relative group">
              <img
                src={screenshotUrl}
                alt="Screenshot showing accessibility violations highlighted"
                className="w-full max-w-4xl mx-auto rounded border border-slate-600 cursor-zoom-in transition-transform hover:scale-[1.02]"
                onError={() => setScreenshotError(true)}
                onLoad={() => setScreenshotError(false)}
                onClick={handleImageClick}
              />
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Screenshot not available</p>
              <p className="text-sm mt-1">
                The violation screenshot could not be loaded
              </p>
            </div>
          )}
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div className="relative max-w-full max-h-full">
            {/* Close button */}
            <Button
              variant="outline"
              size="sm"
              className="absolute -top-12 right-0 z-10 bg-white hover:bg-gray-100"
              onClick={handleCloseZoom}
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>

            {/* Zoom controls */}
            <div className="absolute -top-12 left-0 z-10 flex gap-2">
              <div className="bg-white text-black px-3 py-1 rounded text-sm flex items-center gap-2">
                <ZoomOut className="w-4 h-4" />
                Click outside to zoom out
              </div>
            </div>

            {/* Zoomed image */}
            <img
              src={screenshotUrl}
              alt="Screenshot showing accessibility violations highlighted (zoomed)"
              className="max-w-full max-h-full rounded border border-slate-600 cursor-zoom-out"
              onClick={handleCloseZoom}
            />
          </div>
        </div>
      )}
    </div>
  );
}
