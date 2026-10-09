"use client";

import BarcodeTag from "./BarcodeTag";
import { PAPER_SIZES, type BarcodeSettings } from "../config";
import type { BarcodeLayout } from "../lib/layout";

interface BarcodePreviewProps {
  settings: BarcodeSettings;
  layout: BarcodeLayout;
}

export default function BarcodePreview({
  settings,
  layout,
}: BarcodePreviewProps) {
  const selectedPaper = PAPER_SIZES[settings.paperType];

  return (
    <>
      <style>{`
        @page {
          size: ${selectedPaper.widthMm}mm ${selectedPaper.heightMm}mm;
          margin: 0;
        }
        @media print {
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }

          .print-root {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
          }

          .print-preview {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
            padding: 0 !important;
          }

          aside, button {
            display: none !important;
          }

          .print-page {
            display: block !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            zoom: 1 !important;
            width: ${selectedPaper.widthMm}mm !important;
            height: ${selectedPaper.heightMm}mm !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: always !important;
            break-after: page !important;
            box-sizing: border-box !important;
          }

          .print-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      `}</style>

      <main className="print-preview @container flex min-w-0 flex-1 flex-col items-center gap-8 overflow-auto p-3 sm:p-5 xl:p-8">
        {layout.pages.length === 0 ? (
          <div
            style={{
              width: `${layout.paperWidthPx}px`,
              height: `${layout.paperHeightPx}px`,
            }}
            className="flex items-center justify-center rounded-sm border border-gray-400 bg-white text-gray-400 shadow-lg"
          >
            Click &quot;Generate&quot; to build sequence
          </div>
        ) : (
          layout.pages.map((pageItems, pageIdx) => (
            <div
              key={pageIdx}
              style={{
                width: `${layout.paperWidthPx}px`,
                height: `${layout.paperHeightPx}px`,
                padding: `${layout.marginPx}px`,
                zoom: `min(1, calc(100cqw / ${layout.paperWidthPx}px))`,
              }}
              className="print-page box-border rounded-sm border border-gray-400 bg-white text-black shadow-lg transition-all"
            >
              <div
                style={{
                  height: `${layout.printableHeightPx}px`,
                  gap: `${layout.gapPx}px`,
                }}
                className="flex flex-col flex-wrap content-start items-start"
              >
                {pageItems.map((item, itemIdx) => (
                  <BarcodeTag
                    key={`${pageIdx}-${itemIdx}`}
                    value={item.numStr}
                    displayValue={item.display}
                    widthPx={layout.itemWidthPx}
                    heightPx={layout.itemHeightPx}
                    paddingCm={settings.paddingCm}
                    extraLabelText={
                      settings.extraLabels.find((label) =>
                        label.ids
                          .split(/[,&]/)
                          .map((id) => id.trim())
                          .includes(item.numStr)
                      )?.text
                    }
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </>
  );
}
