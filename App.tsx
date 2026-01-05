
import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, Download, RefreshCcw, CheckCircle2, AlertCircle, Info, Sparkles, Trash2, Hash } from 'lucide-react';
import { processExcelFile, exportToExcel } from './services/excelProcessor';
import { analyzeConsolidatedData } from './services/geminiService';
import { ConsolidatedData, AnalysisResult } from './types';

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState<ConsolidatedData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setData(null);
    setAnalysis(null);

    try {
      const result = await processExcelFile(file);
      setData(result);
      
      // Request AI insights
      const aiAnalysis = await analyzeConsolidatedData(result.rows as any[][], result.sheetNames.length);
      setAnalysis(aiAnalysis);
    } catch (err) {
      console.error(err);
      setError("Erro ao processar o arquivo. Verifique se é um arquivo Excel válido.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (data) {
      exportToExcel(data.rows as any[][], data.fileName);
    }
  };

  const reset = () => {
    setData(null);
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-md shadow-blue-100">
              <FileSpreadsheet className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Consolidador Next</h1>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Auto-Cleaning Engine</p>
            </div>
          </div>
          {data && (
            <button 
              onClick={reset}
              className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              <RefreshCcw className="w-4 h-4" />
              Recomeçar
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {!data && !isProcessing && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Adeus, Alt+F11!</h2>
              <p className="text-lg text-slate-600">
                Processamento inteligente de planilhas do <b>Next Comercial</b>. Removemos títulos, repetidores de cabeçalho e limpamos códigos automaticamente.
              </p>
            </div>

            <label className="relative group cursor-pointer block">
              <input 
                type="file" 
                className="hidden" 
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
              />
              <div className="border-2 border-dashed border-slate-300 group-hover:border-blue-500 rounded-2xl p-12 transition-all bg-white shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 flex flex-col items-center">
                <div className="bg-blue-50 p-5 rounded-full mb-6 group-hover:bg-blue-100 transition-colors">
                  <Upload className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Selecione a planilha exportada</h3>
                <p className="text-slate-500 text-sm">Arraste o arquivo aqui para processar instantaneamente</p>
              </div>
            </label>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Trash2, title: "Limpeza Profunda", desc: "Remove 'PRODUTOS' e cabeçalhos repetidos a cada 33 linhas." },
                { icon: Hash, title: "Formatador de Código", desc: "Remove zeros à esquerda da Coluna A automaticamente." },
                { icon: Sparkles, title: "Colunas A-F", desc: "Isola apenas as colunas essenciais para o seu relatório." }
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 transition-colors">
                  <item.icon className="w-6 h-6 text-blue-600 mb-3" />
                  <h4 className="font-bold text-slate-800 mb-1">{item.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 w-10 h-10 animate-pulse" />
            </div>
            <h3 className="mt-8 text-2xl font-bold text-slate-800">Limpando sua Planilha...</h3>
            <p className="text-slate-500 mt-2">Removendo ruídos, cabeçalhos extras e zeros à esquerda</p>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 p-6 rounded-2xl flex gap-4 items-center text-red-700 shadow-sm">
            <AlertCircle className="shrink-0 w-8 h-8" />
            <div>
              <p className="font-bold">Ops! Algo deu errado.</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        {data && !isProcessing && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Resultado da Limpeza</h3>
                      <p className="text-xs text-slate-500 font-medium">Visualização rápida das primeiras 10 linhas limpas</p>
                    </div>
                    <button 
                      onClick={handleDownload}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95 group"
                    >
                      <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                      Exportar Excel Limpo
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white border-b border-slate-100">
                        <tr>
                          {data.headers.map((h, i) => (
                            <th key={i} className="px-6 py-4 font-bold text-slate-800 bg-slate-50/30 uppercase text-[11px] tracking-wider">
                              <div className="flex items-center gap-2">
                                {i === 0 && <Hash className="w-3 h-3 text-blue-500" />}
                                {h || `Coluna ${String.fromCharCode(65+i)}`}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {(data.rows as any[][]).slice(1, 11).map((row, i) => (
                          <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                            {row.map((cell, j) => (
                              <td key={j} className={`px-6 py-4 text-slate-600 whitespace-nowrap ${j === 0 ? 'font-mono text-blue-700' : ''}`}>
                                {cell !== null ? String(cell) : '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {data.rows.length > 11 && (
                      <div className="px-6 py-4 text-center text-slate-400 text-xs font-medium border-t border-slate-50">
                        + {data.rows.length - 11} linhas processadas e limpas
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Relatório de Operação</h3>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-600 text-sm font-medium">Produtos Reais</span>
                      <span className="font-extrabold text-blue-600 text-xl">{analysis?.stats.totalItems || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-600 text-sm font-medium">Abas Unificadas</span>
                      <span className="font-bold text-slate-900 text-lg">{analysis?.stats.totalSheets || 0}</span>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center gap-3 text-emerald-600 font-semibold text-xs py-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        Título 'PRODUTOS' removido
                      </div>
                      <div className="flex items-center gap-3 text-emerald-600 font-semibold text-xs py-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        Zeros à esquerda limpos (Coluna A)
                      </div>
                      <div className="flex items-center gap-3 text-emerald-600 font-semibold text-xs py-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        Cabeçalhos repetidos excluídos
                      </div>
                    </div>
                  </div>
                </div>

                {analysis && (
                  <div className="bg-slate-900 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group">
                    <div className="absolute -right-6 -bottom-6 opacity-10 transform -rotate-12 transition-transform group-hover:scale-110">
                      <Sparkles className="w-32 h-32 text-blue-400" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4 bg-blue-500/20 w-fit px-3 py-1 rounded-full border border-blue-500/30">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-bold uppercase tracking-widest text-[10px] text-blue-300">Resumo da IA</span>
                      </div>
                      <p className="text-sm leading-relaxed mb-6 text-slate-300">
                        {analysis.summary}
                      </p>
                      <div className="space-y-3">
                        {analysis.insights.map((insight, idx) => (
                          <div key={idx} className="flex gap-3 text-xs bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="shrink-0 text-blue-400 font-bold">{idx + 1}.</div>
                            <p className="text-slate-300 italic">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Certificado para Sistema Next Comercial
          </div>
          <p className="text-slate-400 text-[11px] uppercase tracking-widest">
            Privacidade Garantida • Processamento Local
          </p>
        </div>
      </footer>
    </div>
  );
}
