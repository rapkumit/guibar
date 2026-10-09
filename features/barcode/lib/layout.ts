import { PAPER_SIZES, type BarcodeSettings } from "../config";

export interface BarcodeItem {
  numStr: string;
  display: string;
}

export interface BarcodeLayout {
  paperWidthPx: number;
  paperHeightPx: number;
  printableHeightPx: number;
  marginPx: number;
  gapPx: number;
  itemWidthPx: number;
  itemHeightPx: number;
  pages: BarcodeItem[][];
}

const cmToPx = (cm: number) => Math.round(cm * 37.795);
const mmToPx = (mm: number) => Math.round(mm * 3.7795);

export function createBarcodeLayout(
  settings: BarcodeSettings,
  sequence: string[]
): BarcodeLayout {
  const paper = PAPER_SIZES[settings.paperType];
  const paperWidthPx = mmToPx(paper.widthMm);
  const paperHeightPx = mmToPx(paper.heightMm);
  const marginPx = cmToPx(settings.marginCm);
  const gapPx = cmToPx(settings.barcodeGapCm);
  const itemWidthPx = cmToPx(settings.barcodeWidthCm);
  const itemHeightPx = cmToPx(settings.barcodeHeightCm);
  const printableWidthPx = paperWidthPx - marginPx * 2;
  const printableHeightPx = paperHeightPx - marginPx * 2;

  const rowsPerPage = Math.max(
    1,
    Math.floor((printableHeightPx + gapPx) / (itemHeightPx + gapPx))
  );
  const colsPerPage = Math.max(
    1,
    Math.floor((printableWidthPx + gapPx) / (itemWidthPx + gapPx))
  );

  const allItems: BarcodeItem[] = [];
  sequence.forEach((numStr) => {
    for (let copy = 0; copy < settings.pcsPerCode; copy++) {
      allItems.push({
        numStr,
        display: `${settings.prefix}${numStr}${settings.suffix}`,
      });
    }
  });

  const itemsPerPageCount = rowsPerPage * colsPerPage;
  const pages: BarcodeItem[][] = [];
  for (let index = 0; index < allItems.length; index += itemsPerPageCount) {
    pages.push(allItems.slice(index, index + itemsPerPageCount));
  }

  return {
    paperWidthPx,
    paperHeightPx,
    printableHeightPx,
    marginPx,
    gapPx,
    itemWidthPx,
    itemHeightPx,
    pages,
  };
}
