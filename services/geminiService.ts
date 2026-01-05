
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeConsolidatedData = async (data: any[][], sheetCount: number): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Sample data to send to Gemini (limit to first 20 rows to avoid token explosion)
  const sampleData = data.slice(0, 20).map(row => row.join(' | ')).join('\n');
  
  const prompt = `
    Analise esta amostra de dados de uma planilha de produtos consolidada do sistema Next Comercial.
    A planilha unificou ${sheetCount} abas diferentes e contém um total de ${data.length} registros.
    
    Amostra dos dados (Colunas A-F):
    ${sampleData}
    
    Por favor, forneça um resumo amigável do que foi processado e 3 insights rápidos ou avisos sobre a qualidade/conteúdo dos dados.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "insights"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return {
      ...result,
      stats: {
        totalItems: data.length > 0 ? data.length - 1 : 0, // Exclude header
        totalSheets: sheetCount
      }
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "Consolidação concluída com sucesso. Não foi possível realizar a análise inteligente no momento.",
      insights: ["Verifique se os dados nas colunas A-F estão corretos.", "A planilha está pronta para exportação."],
      stats: {
        totalItems: data.length > 0 ? data.length - 1 : 0,
        totalSheets: sheetCount
      }
    };
  }
};
