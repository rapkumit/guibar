"use client";

import BarcodePreview from "./components/BarcodePreview";
import Sidebar from "../sidebar/Sidebar";
import { createBarcodeLayout } from "./lib/layout";
import useBarcodeSettings from "./hooks/useBarcodeSettings";

export default function BarcodeGenerator() {
  const { settings, generatedSequence, handleSettingsChange, generate } =
    useBarcodeSettings();
  const layout = createBarcodeLayout(settings, generatedSequence);

  return (
    <div className="print-root flex min-h-screen flex-col bg-gray-100 font-sans text-gray-800 dark:bg-zinc-950 dark:text-gray-100 xl:h-screen xl:flex-row">
      <Sidebar
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onGenerate={generate}
      />
      <BarcodePreview settings={settings} layout={layout} />
    </div>
  );
}
