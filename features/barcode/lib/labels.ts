export function matchesBarcodeId(idList: string, barcodeId: string): boolean {
  const barcodeNumber = Number(barcodeId);
  const hasNumericBarcodeId =
    /^\d+$/.test(barcodeId) && Number.isSafeInteger(barcodeNumber);

  return idList.split(/[,&]/).some((entry) => {
    const id = entry.trim();
    if (id === barcodeId) return true;

    const range = id.match(/^(\d+)\s*-\s*(\d+)$/);
    if (!range || !hasNumericBarcodeId) return false;

    const start = Number(range[1]);
    const end = Number(range[2]);
    return (
      Number.isSafeInteger(start) &&
      Number.isSafeInteger(end) &&
      start <= end &&
      barcodeNumber >= start &&
      barcodeNumber <= end
    );
  });
}
