"use client";

import { useState } from "react";
import Barcode from "./barcode";

const PAPER_SIZES = {
  A4: { widthMm: 210, heightMm: 297, label: "A4 (210 x 297 mm)" },
  Letter: { widthMm: 216, heightMm: 279, label: "Letter (8.5 x 11 in)" },
  Legal: { widthMm: 216, heightMm: 356, label: "Legal (8.5 x 14 in)" },
  A3: { widthMm: 297, heightMm: 420, label: "A3 (297 x 420 mm)" },
};

export default function Home() {
  // Sequence Controls
  const [prefix, setPrefix] = useState("A-");
  const [suffix, setSuffix] = useState("-Z");
  const [startVal, setStartVal] = useState(1);
  const [endVal, setEndVal] = useState(10);
  const [increment, setIncrement] = useState(1);

  // Page Controls
  const [paperType, setPaperType] = useState<keyof typeof PAPER_SIZES>("A4");
  const [marginCm, setMarginCm] = useState(1.0);
  const [pcsPerCode, setPcsPerCode] = useState(16);
  const [barcodeWidthCm, setBarcodeWidthCm] = useState(3.5);
  const [barcodeHeightCm, setBarcodeHeightCm] = useState(2.0);
  const [paddingCm, setPaddingCm] = useState(0.1);
  const [barcodeGapCm, setBarcodeGapCm] = useState(0.2);

  const [generatedSequence, setGeneratedSequence] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(true);

  // Standard CSS DPI conversion (96dpi -> 1cm = 37.795px, 1mm = 3.7795px)
  const cmToPx = (cm: number) => Math.round(cm * 37.795);
  const mmToPx = (mm: number) => Math.round(mm * 3.7795);

  const handleGenerate = () => {
    const list: string[] = [];
    if (increment <= 0 || startVal > endVal) return;

    for (let i = startVal; i <= endVal; i += increment) {
      const numStr = i.toString().padStart(4, "0");
      list.push(numStr);
    }
    setGeneratedSequence(list);
  };

  const selectedPaper = PAPER_SIZES[paperType];

  // Exact dimension pixel values
  const paperWidthPx = mmToPx(selectedPaper.widthMm);
  const paperHeightPx = mmToPx(selectedPaper.heightMm);

  const marginPx = cmToPx(marginCm);
  const gapPx = cmToPx(barcodeGapCm);

  const itemWidthPx = cmToPx(barcodeWidthCm);
  const itemHeightPx = cmToPx(barcodeHeightCm);

  const printableWidthPx = paperWidthPx - marginPx * 2;
  const printableHeightPx = paperHeightPx - marginPx * 2;

  // Calculate how many rows and cols fit strictly per page
  const rowsPerPage = Math.max(
    1,
    Math.floor((printableHeightPx + gapPx) / (itemHeightPx + gapPx))
  );
  const colsPerPage = Math.max(
    1,
    Math.floor((printableWidthPx + gapPx) / (itemWidthPx + gapPx))
  );

  // Build full item list with column grouping preserved
  interface BarcodeItem {
    numStr: string;
    display: string;
  }

  const allItems: BarcodeItem[] = [];
  generatedSequence.forEach((numStr) => {
    for (let i = 0; i < pcsPerCode; i++) {
      allItems.push({
        numStr,
        display: `${prefix}${numStr}${suffix}`,
      });
    }
  });

  // Split into pages based on column capacity (stacking top-to-bottom first)
  const itemsPerPageCount = rowsPerPage * colsPerPage;
  const pages: BarcodeItem[][] = [];

  for (let i = 0; i < allItems.length; i += itemsPerPageCount) {
    pages.push(allItems.slice(i, i + itemsPerPageCount));
  }

  return (
    <div className="print-root flex min-h-screen flex-col bg-gray-100 font-sans text-gray-800 dark:bg-zinc-950 dark:text-gray-100 xl:h-screen xl:flex-row">
      
      {/* Strict Print CSS */}
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

      {/* SIDEBAR CONTROL PANEL */}
      <aside className="flex w-full flex-col gap-6 bg-white p-4 shadow-sm dark:bg-zinc-900 sm:p-6 xl:h-full xl:w-80 xl:shrink-0 xl:overflow-y-auto xl:border-r xl:border-gray-300 xl:dark:border-zinc-800">
        <button
          type="button"
          aria-expanded={settingsOpen}
          aria-controls="settings-panel"
          onClick={() => setSettingsOpen((open) => !open)}
          className="w-full rounded-md border border-gray-300 px-4 py-2 text-left font-semibold transition-colors hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {settingsOpen ? "Hide settings" : "Show settings"}
        </button>

        <div
          id="settings-panel"
          className={`${settingsOpen ? "flex" : "hidden"} flex-col gap-6`}
        >
        {/* Sequence Settings */}
        <section className="border border-gray-300 dark:border-zinc-700 rounded-md p-4 bg-gray-50 dark:bg-zinc-800/50">
          <h2 className="text-lg font-bold mb-3">Generate Sequence</h2>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-xs font-semibold block text-gray-500">Prefix</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block text-gray-500">Suffix</label>
              <input
                type="text"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm dark:bg-zinc-800"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-xs font-semibold block text-gray-500">Start Value</label>
              <input
                type="number"
                value={startVal}
                onChange={(e) => setStartVal(Number(e.target.value))}
                className="w-full border rounded px-2 py-1 text-sm dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="text-xs font-semibold block text-gray-500">End Value</label>
              <input
                type="number"
                value={endVal}
                onChange={(e) => setEndVal(Number(e.target.value))}
                className="w-full border rounded px-2 py-1 text-sm dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="text-xs font-semibold block text-gray-500">Increment</label>
              <input
                type="number"
                value={increment}
                onChange={(e) => setIncrement(Number(e.target.value))}
                className="w-full border rounded px-2 py-1 text-sm dark:bg-zinc-800"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors"
          >
            Generate
          </button>
        </section>

        {/* Page & Dimension Settings */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Page Settings</h2>

          <div>
            <label className="text-xs font-semibold block text-gray-500">Paper Size</label>
            <select
              value={paperType}
              onChange={(e) => setPaperType(e.target.value as keyof typeof PAPER_SIZES)}
              className="w-full border rounded px-2 py-1.5 text-sm dark:bg-zinc-800"
            >
              {Object.entries(PAPER_SIZES).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold block text-gray-500">Page Margin (cm)</label>
            <input
              type="number"
              step="0.1"
              value={marginCm}
              onChange={(e) => setMarginCm(Number(e.target.value))}
              className="w-full border rounded px-2 py-1 text-sm dark:bg-zinc-800"
            />
          </div>

          <div>
            <label className="text-xs font-semibold block text-gray-500">Gap between Barcodes (cm)</label>
            <input
              type="number"
              step="0.05"
              min="0"
              value={barcodeGapCm}
              onChange={(e) => setBarcodeGapCm(Number(e.target.value))}
              className="w-full border rounded px-2 py-1 text-sm dark:bg-zinc-800"
            />
          </div>

          <div>
            <label className="text-xs font-semibold block text-gray-500">How many pcs each code</label>
            <input
              type="number"
              min="1"
              value={pcsPerCode}
              onChange={(e) => setPcsPerCode(Number(e.target.value))}
              className="w-full border rounded px-2 py-1 text-sm dark:bg-zinc-800"
            />
          </div>

          <div>
            <label className="text-xs font-semibold block text-gray-500">Barcode Width (cm)</label>
            <input
              type="number"
              step="0.1"
              value={barcodeWidthCm}
              onChange={(e) => setBarcodeWidthCm(Number(e.target.value))}
              className="w-full border rounded px-2 py-1 text-sm dark:bg-zinc-800"
            />
          </div>

          <div>
            <label className="text-xs font-semibold block text-gray-500">Barcode Height (cm)</label>
            <input
              type="number"
              step="0.1"
              value={barcodeHeightCm}
              onChange={(e) => setBarcodeHeightCm(Number(e.target.value))}
              className="w-full border rounded px-2 py-1 text-sm dark:bg-zinc-800"
            />
          </div>

          <div>
            <label className="text-xs font-semibold block text-gray-500">Barcode Padding (cm)</label>
            <input
              type="number"
              step="0.05"
              min="0"
              value={paddingCm}
              onChange={(e) => setPaddingCm(Number(e.target.value))}
              className="w-full border rounded px-2 py-1 text-sm dark:bg-zinc-800"
            />
          </div>

          <button
            onClick={() => window.print()}
            className="w-full mt-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 rounded-md transition-colors"
          >
            Print Sheet
          </button>
        </section>
        </div>
      </aside>

      {/* PREVIEW CONTAINER */}
      <main className="print-preview @container flex min-w-0 flex-1 flex-col items-center gap-8 overflow-auto p-3 sm:p-5 xl:p-8">
        {pages.length === 0 ? (
          <div
            style={{
              width: `${paperWidthPx}px`,
              height: `${paperHeightPx}px`,
            }}
            className="bg-white border border-gray-400 shadow-lg text-black rounded-sm flex items-center justify-center text-gray-400"
          >
            Click &quot;Generate&quot; to build sequence
          </div>
        ) : (
          pages.map((pageItems, pageIdx) => (
            <div
              key={pageIdx}
              style={{
                width: `${paperWidthPx}px`,
                height: `${paperHeightPx}px`,
                padding: `${marginPx}px`,
                zoom: `min(1, calc(100cqw / ${paperWidthPx}px))`,
              }}
              className="print-page bg-white border border-gray-400 shadow-lg text-black rounded-sm transition-all box-border"
            >
              {/* Flex column container creates top-to-bottom column stacking */}
              <div
                style={{
                  height: `${printableHeightPx}px`,
                  gap: `${gapPx}px`,
                }}
                className="flex flex-col flex-wrap items-start content-start"
              >
                {pageItems.map((item, itemIdx) => (
                  <Barcode
                    key={`${pageIdx}-${itemIdx}`}
                    value={item.numStr}
                    displayValue={item.display}
                    widthPx={itemWidthPx}
                    heightPx={itemHeightPx}
                    paddingCm={paddingCm}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </main>

    </div>
  );
}