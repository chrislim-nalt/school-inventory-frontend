import { useState } from "react";
import { exportToPDF, exportToExcel, exportToCSV } from "./services/exportService";

export default function DownloadButton({ data, columns, title, filename, variant = "primary" }) {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleExport = async (format) => {
    setLoading(true);
    try {
      switch (format) {
        case "pdf":
          exportToPDF(data, columns, title, filename);
          break;
        case "excel":
          exportToExcel(data, columns, filename);
          break;
        case "csv":
          exportToCSV(data, columns, filename);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  };

  const buttonStyles = {
    primary: "bg-blue-600 hover:bg-blue-700",
    secondary: "bg-gray-600 hover:bg-gray-700",
    success: "bg-green-600 hover:bg-green-700",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={loading}
        className={`${buttonStyles[variant]} text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {showMenu && !loading && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-20 border overflow-hidden">
            <button
              onClick={() => handleExport("pdf")}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <span className="text-red-500">📄</span> PDF Document
            </button>
            <button
              onClick={() => handleExport("excel")}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <span className="text-green-600">📊</span> Excel (.xlsx)
            </button>
            <button
              onClick={() => handleExport("csv")}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors border-t"
            >
              <span className="text-blue-500">📋</span> CSV (.csv)
            </button>
          </div>
        </>
      )}
    </div>
  );
}