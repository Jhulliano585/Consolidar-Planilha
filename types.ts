
export interface ProductRow {
  [key: string]: any;
}

export interface ConsolidatedData {
  fileName: string;
  rows: ProductRow[];
  headers: string[];
  sheetNames: string[];
}

export interface AnalysisResult {
  summary: string;
  insights: string[];
  stats: {
    totalItems: number;
    totalSheets: number;
  };
}
