"use client";

import { useState } from "react";
import {
  DEFAULT_BARCODE_SETTINGS,
  type BarcodeSettings,
} from "../config";

export default function useBarcodeSettings() {
  const [settings, setSettings] = useState<BarcodeSettings>(
    DEFAULT_BARCODE_SETTINGS
  );
  const [generatedSequence, setGeneratedSequence] = useState<string[]>([]);

  const handleSettingsChange = (changes: Partial<BarcodeSettings>) => {
    setSettings((current) => ({ ...current, ...changes }));
  };

  const generate = () => {
    const { startVal, endVal, increment } = settings;
    if (increment <= 0 || startVal > endVal) return;

    const sequence: string[] = [];
    for (let value = startVal; value <= endVal; value += increment) {
      sequence.push(value.toString().padStart(4, "0"));
    }
    setGeneratedSequence(sequence);
  };

  return {
    settings,
    generatedSequence,
    handleSettingsChange,
    generate,
  };
}
