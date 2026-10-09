"use client";

import { useState, useSyncExternalStore } from "react";
import { PAPER_SIZES, type BarcodeSettings } from "../barcode/config";

interface SavedPreset extends BarcodeSettings {
  name: string;
}

interface SidebarProps {
  settings: BarcodeSettings;
  onSettingsChange: (settings: Partial<BarcodeSettings>) => void;
  onGenerate: () => void;
}

const PRESETS_STORAGE_KEY = "guibar-barcode-presets";
const PRESETS_CHANGE_EVENT = "guibar-presets-change";
const PRESETS_STORAGE_ERROR = "!storage-error:";

function subscribeToPresets(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(PRESETS_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(PRESETS_CHANGE_EVENT, onChange);
  };
}

function getPresetsSnapshot() {
  try {
    return window.localStorage.getItem(PRESETS_STORAGE_KEY) ?? "[]";
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown storage error.";
    return `${PRESETS_STORAGE_ERROR}${message}`;
  }
}

function getServerPresetsSnapshot() {
  return "[]";
}

function storePresets(presets: SavedPreset[]) {
  window.localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
  window.dispatchEvent(new Event(PRESETS_CHANGE_EVENT));
}

function isSavedPreset(value: unknown): value is SavedPreset {
  if (typeof value !== "object" || value === null) return false;

  const preset = value as Record<string, unknown>;
  const numericSettings = [
    "startVal",
    "endVal",
    "increment",
    "marginCm",
    "pcsPerCode",
    "barcodeWidthCm",
    "barcodeHeightCm",
    "paddingCm",
    "barcodeGapCm",
  ] as const;

  return (
    typeof preset.name === "string" &&
    typeof preset.prefix === "string" &&
    typeof preset.suffix === "string" &&
    typeof preset.paperType === "string" &&
    preset.paperType in PAPER_SIZES &&
    numericSettings.every(
      (key) => typeof preset[key] === "number" && Number.isFinite(preset[key])
    ) &&
    Array.isArray(preset.extraLabels) &&
    preset.extraLabels.every(
      (label) =>
        typeof label === "object" &&
        label !== null &&
        typeof label.ids === "string" &&
        typeof label.text === "string"
    )
  );
}

export default function Sidebar({
  settings,
  onSettingsChange,
  onGenerate,
}: SidebarProps) {
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [presetName, setPresetName] = useState("");
  const [selectedPresetName, setSelectedPresetName] = useState("");
  const [presetNotice, setPresetNotice] = useState("");
  const presetsSnapshot = useSyncExternalStore(
    subscribeToPresets,
    getPresetsSnapshot,
    getServerPresetsSnapshot
  );

  let savedPresets: SavedPreset[] = [];
  let presetStorageError = "";
  if (presetsSnapshot.startsWith(PRESETS_STORAGE_ERROR)) {
    presetStorageError = `Could not load saved presets: ${presetsSnapshot.slice(
      PRESETS_STORAGE_ERROR.length
    )}`;
  } else {
    try {
      const parsed: unknown = JSON.parse(presetsSnapshot);
      if (!Array.isArray(parsed) || !parsed.every(isSavedPreset)) {
        throw new Error("Saved presets have an invalid format.");
      }
      savedPresets = parsed;
    } catch (error) {
      presetStorageError = `Could not load saved presets: ${
        error instanceof Error ? error.message : "Unknown storage error."
      }`;
    }
  }

  const updateSettings = (changes: Partial<BarcodeSettings>) => {
    onSettingsChange(changes);
  };

  const savePreset = () => {
    if (presetStorageError) {
      setPresetNotice(presetStorageError);
      return;
    }
    const name = presetName.trim();
    if (!name) {
      setPresetNotice("Enter a name for this preset.");
      return;
    }

    const updatedPresets = [
      ...savedPresets.filter((preset) => preset.name !== name),
      { name, ...settings },
    ];

    try {
      storePresets(updatedPresets);
      setSelectedPresetName(name);
      setPresetName(name);
      setPresetNotice(`Preset "${name}" saved on this device.`);
    } catch (error) {
      setPresetNotice(
        `Could not save preset: ${
          error instanceof Error ? error.message : "Unknown storage error."
        }`
      );
    }
  };

  const loadPreset = () => {
    const preset = savedPresets.find(
      (savedPreset) => savedPreset.name === selectedPresetName
    );
    if (!preset) {
      setPresetNotice("Select a saved preset to load.");
      return;
    }

    const { name, ...presetSettings } = preset;
    onSettingsChange(presetSettings);
    setPresetName(name);
    setPresetNotice(`Preset "${name}" loaded.`);
  };

  const deletePreset = () => {
    if (presetStorageError) {
      setPresetNotice(presetStorageError);
      return;
    }
    const updatedPresets = savedPresets.filter(
      (preset) => preset.name !== selectedPresetName
    );
    if (updatedPresets.length === savedPresets.length) {
      setPresetNotice("Select a saved preset to delete.");
      return;
    }

    try {
      storePresets(updatedPresets);
      setSelectedPresetName("");
      setPresetName("");
      setPresetNotice("Preset deleted from this device.");
    } catch (error) {
      setPresetNotice(
        `Could not delete preset: ${
          error instanceof Error ? error.message : "Unknown storage error."
        }`
      );
    }
  };

  return (
    <aside className="flex w-full flex-col gap-4 bg-white p-4 shadow-sm dark:bg-zinc-900 sm:p-5 xl:h-full xl:w-80 xl:shrink-0 xl:overflow-y-auto xl:border-r xl:border-gray-300 xl:dark:border-zinc-800">
      <div>
        <h1 className="text-xl font-bold">Barcode generator</h1>
        <p className="text-sm text-gray-500">Configure and print barcode sheets</p>
      </div>
      <button
        type="button"
        aria-expanded={settingsOpen}
        aria-controls="settings-panel"
        onClick={() => setSettingsOpen((open) => !open)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-left text-sm font-semibold transition-colors hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        {settingsOpen ? "Hide settings" : "Show settings"}
      </button>

      <div
        id="settings-panel"
        className={`${settingsOpen ? "flex" : "hidden"} flex-col gap-4`}
      >
        <section className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
          <div>
            <h2 className="text-base font-bold">Local presets</h2>
            <p className="text-xs text-gray-500">
              Saved in this browser on this device.
            </p>
          </div>
          <div>
            <label
              className="mb-1 block text-xs font-semibold text-gray-500"
              htmlFor="preset-name"
            >
              Preset name
            </label>
            <input
              id="preset-name"
              type="text"
              value={presetName}
              onChange={(event) => setPresetName(event.target.value)}
              placeholder="e.g. Small price tags"
              className="w-full rounded border px-2 py-1.5 text-sm dark:bg-zinc-800"
            />
          </div>
          <button
            type="button"
            onClick={savePreset}
            className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Save current settings
          </button>
          <div className="flex gap-2">
            <select
              aria-label="Select a saved preset"
              value={selectedPresetName}
              onChange={(event) => {
                setSelectedPresetName(event.target.value);
                setPresetName(event.target.value);
                setPresetNotice("");
              }}
              className="min-w-0 flex-1 rounded border px-2 py-1.5 text-sm dark:bg-zinc-800"
            >
              <option value="">Choose a preset</option>
              {savedPresets.map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {preset.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={loadPreset}
              disabled={!selectedPresetName}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold enabled:hover:bg-gray-100 disabled:opacity-50 dark:border-zinc-700 dark:enabled:hover:bg-zinc-700"
            >
              Load
            </button>
            <button
              type="button"
              onClick={deletePreset}
              disabled={!selectedPresetName}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-red-600 enabled:hover:bg-red-50 disabled:opacity-50 dark:border-zinc-700 dark:enabled:hover:bg-zinc-700"
            >
              Delete
            </button>
          </div>
          {(presetNotice || presetStorageError) && (
            <p className="text-xs text-gray-600 dark:text-gray-300" role="status">
              {presetNotice || presetStorageError}
            </p>
          )}
        </section>

        <section className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
          <h2 className="mb-3 text-base font-bold">Generate sequence</h2>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-500">Prefix</label>
              <input
                type="text"
                value={settings.prefix}
                onChange={(event) => updateSettings({ prefix: event.target.value })}
                className="w-full rounded border px-2 py-1 text-sm dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500">Suffix</label>
              <input
                type="text"
                value={settings.suffix}
                onChange={(event) => updateSettings({ suffix: event.target.value })}
                className="w-full rounded border px-2 py-1 text-sm dark:bg-zinc-800"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-500">Start value</label>
              <input
                type="number"
                value={settings.startVal}
                onChange={(event) => updateSettings({ startVal: Number(event.target.value) })}
                className="w-full rounded border px-2 py-1 text-sm dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500">End value</label>
              <input
                type="number"
                value={settings.endVal}
                onChange={(event) => updateSettings({ endVal: Number(event.target.value) })}
                className="w-full rounded border px-2 py-1 text-sm dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500">Increment</label>
              <input
                type="number"
                value={settings.increment}
                onChange={(event) => updateSettings({ increment: Number(event.target.value) })}
                className="w-full rounded border px-2 py-1 text-sm dark:bg-zinc-800"
              />
            </div>
          </div>
          <button
            onClick={onGenerate}
            className="mt-4 w-full rounded-md bg-blue-600 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Generate
          </button>
        </section>

        <section className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
          <h2 className="text-base font-bold">Sheet &amp; tag layout</h2>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Paper size</label>
            <select
              value={settings.paperType}
              onChange={(event) =>
                updateSettings({ paperType: event.target.value as keyof typeof PAPER_SIZES })
              }
              className="w-full rounded border px-2 py-1.5 text-sm dark:bg-zinc-800"
            >
              {Object.entries(PAPER_SIZES).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Page margin (cm)</label>
              <input
                type="number"
                step="0.1"
                value={settings.marginCm}
                onChange={(event) => updateSettings({ marginCm: Number(event.target.value) })}
                className="w-full rounded border px-2 py-1 text-sm dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Tag gap (cm)</label>
              <input
                type="number"
                step="0.05"
                min="0"
                value={settings.barcodeGapCm}
                onChange={(event) => updateSettings({ barcodeGapCm: Number(event.target.value) })}
                className="w-full rounded border px-2 py-1 text-sm dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Copies per ID</label>
              <input
                type="number"
                min="1"
                value={settings.pcsPerCode}
                onChange={(event) => updateSettings({ pcsPerCode: Number(event.target.value) })}
                className="w-full rounded border px-2 py-1 text-sm dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Tag width (cm)</label>
              <input
                type="number"
                step="0.1"
                value={settings.barcodeWidthCm}
                onChange={(event) =>
                  updateSettings({ barcodeWidthCm: Number(event.target.value) })
                }
                className="w-full rounded border px-2 py-1 text-sm dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Tag height (cm)</label>
              <input
                type="number"
                step="0.1"
                value={settings.barcodeHeightCm}
                onChange={(event) =>
                  updateSettings({ barcodeHeightCm: Number(event.target.value) })
                }
                className="w-full rounded border px-2 py-1 text-sm dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Tag padding (cm)</label>
              <input
                type="number"
                step="0.05"
                min="0"
                value={settings.paddingCm}
                onChange={(event) => updateSettings({ paddingCm: Number(event.target.value) })}
                className="w-full rounded border px-2 py-1 text-sm dark:bg-zinc-800"
              />
            </div>
          </div>
        </section>

        <details className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
          <summary className="cursor-pointer text-base font-bold">
            <span className="flex items-center justify-between">
              <span>Text per barcode ID</span>
              <span className="text-xs font-normal text-gray-500">
                {settings.extraLabels.length
                  ? `${settings.extraLabels.length} ${
                      settings.extraLabels.length === 1 ? "rule" : "rules"
                    }`
                  : "Optional"}
              </span>
            </span>
          </summary>
          <div className="mt-3 space-y-3">
            <p className="text-xs text-gray-500">
              Separate IDs with commas or &amp;. Keep leading zeros; IDs in the same row share the text.
            </p>
            {settings.extraLabels.map((label, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <input
                  type="text"
                  aria-label={`Barcode IDs for label ${index + 1}`}
                  value={label.ids}
                  onChange={(event) =>
                    updateSettings({
                      extraLabels: settings.extraLabels.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, ids: event.target.value } : item
                      ),
                    })
                  }
                  placeholder="IDs (e.g. 0001, 0003, & 0005)"
                  className="w-full min-w-0 rounded border px-2 py-1.5 text-sm dark:bg-zinc-800"
                />
                <input
                  type="text"
                  aria-label={`Text for barcode IDs ${label.ids || index + 1}`}
                  value={label.text}
                  onChange={(event) =>
                    updateSettings({
                      extraLabels: settings.extraLabels.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, text: event.target.value } : item
                      ),
                    })
                  }
                  placeholder="Text (e.g. $12.99)"
                  className="w-full min-w-0 rounded border px-2 py-1.5 text-sm dark:bg-zinc-800"
                />
                <button
                  type="button"
                  aria-label={`Remove text for barcode IDs ${label.ids || index + 1}`}
                  onClick={() =>
                    updateSettings({
                      extraLabels: settings.extraLabels.filter(
                        (_, itemIndex) => itemIndex !== index
                      ),
                    })
                  }
                  className="self-end rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                updateSettings({
                  extraLabels: [...settings.extraLabels, { ids: "", text: "" }],
                })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold transition-colors hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Add ID text
            </button>
          </div>
        </details>

        <button
          onClick={() => window.print()}
          className="w-full rounded-md bg-blue-600 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Print sheet
        </button>
      </div>
    </aside>
  );
}
