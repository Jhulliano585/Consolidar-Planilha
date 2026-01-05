
import * as XLSX from 'xlsx';
import { ConsolidatedData, ProductRow } from '../types';

/**
 * Processes the uploaded Excel file.
 * Logic:
 * 1. Read all worksheets.
 * 2. Consolidate rows into one single list.
 * 3. Keep only columns A to F.
 * 4. Remove "PRODUTOS" title row.
 * 5. Remove repeated headers (every 33 lines/page breaks in export).
 * 6. Strip leading zeros from Column A (CÓDIGO).
 */
export const processExcelFile = async (file: File): Promise<ConsolidatedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const consolidatedRows: any[][] = [];
        const sheetNames = workbook.SheetNames;
        let globalHeaders: string[] = [];

        sheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (rawData.length > 0) {
            rawData.forEach((row, index) => {
              // 1. Keep only columns A to F (index 0 to 5)
              const slicedRow = row.slice(0, 6);
              
              // 2. Check if row is empty
              const isEmpty = slicedRow.every(cell => cell === null || cell === undefined || String(cell).trim() === "");
              if (isEmpty) return;

              const firstCell = String(slicedRow[0] || "").trim().toUpperCase();
              const secondCell = String(slicedRow[1] || "").trim().toUpperCase();

              // 3. Filter out "PRODUTOS" rows (usually line 1)
              if (firstCell === "PRODUTOS" || secondCell === "PRODUTOS") return;

              // 4. Identify if this is a header row (CÓDIGO, DESCRIÇÃO, etc.)
              const isHeaderRow = firstCell.includes("CÓDIGO") || secondCell.includes("DESCRIÇÃO");

              if (isHeaderRow) {
                // If it's the very first header we encounter, store it and add to rows
                if (globalHeaders.length === 0) {
                  globalHeaders = slicedRow.map(h => String(h || ''));
                  consolidatedRows.push(slicedRow);
                }
                // Skip adding if it's a repeated header
                return;
              }

              // 5. Clean Column A: Remove leading zeros and convert to integer if possible
              let codeValue = slicedRow[0];
              if (codeValue !== null && codeValue !== undefined) {
                const stringCode = String(codeValue).trim();
                // If it's purely numeric, convert to actual number to strip zeros and stay "inteiro"
                if (/^\d+$/.test(stringCode)) {
                  slicedRow[0] = parseInt(stringCode, 10);
                } else {
                  // If it has characters but starts with zeros, strip them via regex
                  slicedRow[0] = stringCode.replace(/^0+/, '') || "0";
                }
              }

              // 6. Add data row
              consolidatedRows.push(slicedRow);
            });
          }
        });

        resolve({
          fileName: file.name,
          rows: consolidatedRows,
          headers: globalHeaders,
          sheetNames: sheetNames
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

export const exportToExcel = (data: any[][], fileName: string) => {
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Consolidado");
  XLSX.writeFile(wb, `Consolidado_${fileName}`);
};
