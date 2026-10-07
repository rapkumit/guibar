"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeProps {
  value: string;
  displayValue?: string;
  widthPx: number;
  heightPx: number;
  paddingCm?: number;
}

export default function Barcode({
  value,
  displayValue,
  widthPx,
  heightPx,
  paddingCm = 0.1,
}: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const cleanValue = value.replace(/\D/g, "");
  const paddedValue =
    cleanValue.length % 2 !== 0 ? "0" + cleanValue : cleanValue;
  const isValid = paddedValue.length > 0;

  // Convert cm to px (1cm = 37.795px)
  const paddingPx = Math.round(paddingCm * 37.795);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.innerHTML = "";

    if (!isValid) return;

    try {
      JsBarcode(svg, paddedValue, {
        format: "ITF",
        text: displayValue || paddedValue,
        width: 2,
        height: Math.max(15, heightPx - paddingPx * 2 - 22),
        margin: 2,
        fontSize: 12,
        textMargin: 2,
      });
    } catch {
      // Handle invalid renders gracefully
    }
  }, [paddedValue, displayValue, isValid, heightPx, paddingPx]);

  return (
    <div
      style={{
        width: `${widthPx}px`,
        height: `${heightPx}px`,
        padding: `${paddingPx}px`,
      }}
      className="flex items-center justify-center overflow-hidden border border-dashed border-gray-300 bg-white box-border shrink-0"
    >
      {isValid ? (
        <svg ref={svgRef} className="w-full h-full" />
      ) : (
        <span className="text-xs text-red-500">Invalid</span>
      )}
    </div>
  );
}