export const PAPER_SIZES = {
  A4: { widthMm: 210, heightMm: 297, label: "A4 (210 x 297 mm)" },
  Letter: { widthMm: 216, heightMm: 279, label: "Letter (8.5 x 11 in)" },
  Legal: { widthMm: 216, heightMm: 356, label: "Legal (8.5 x 14 in)" },
  A3: { widthMm: 297, heightMm: 420, label: "A3 (297 x 420 mm)" },
};

export interface BarcodeSettings {
  prefix: string;
  suffix: string;
  startVal: number;
  endVal: number;
  increment: number;
  paperType: keyof typeof PAPER_SIZES;
  marginCm: number;
  pcsPerCode: number;
  barcodeWidthCm: number;
  barcodeHeightCm: number;
  paddingCm: number;
  barcodeGapCm: number;
  extraLabels: { ids: string; text: string }[];
}

export const DEFAULT_BARCODE_SETTINGS: BarcodeSettings = {
  prefix: "A-",
  suffix: "-Z",
  startVal: 1,
  endVal: 10,
  increment: 1,
  paperType: "A4",
  marginCm: 1,
  pcsPerCode: 16,
  barcodeWidthCm: 3,
  barcodeHeightCm: 2,
  paddingCm: 0.1,
  barcodeGapCm: 0.2,
  extraLabels: [],
};
