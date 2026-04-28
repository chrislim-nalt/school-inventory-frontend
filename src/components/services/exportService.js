import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Export to PDF
export const exportToPDF = (data, columns, title, filename) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("Starting PDF export...");
      
      if (!data || data.length === 0) {
        reject(new Error("No data to export"));
        return;
      }
      
      // Create new PDF document
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });
      
      // Add title
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(33, 33, 33);
      doc.text(title || "Report", 14, 20);
      
      // Add date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      
      // Add school name
      doc.setFontSize(10);
      doc.text("G.S AGATEKO Inventory System", 14, 38);
      
      // Prepare table data
      const tableColumnHeaders = columns.map(col => col.label);
      const tableBody = data.map(row => 
        columns.map(col => {
          let value = row[col.key];
          if (value === undefined || value === null) return "-";
          return String(value);
        })
      );
      
      // Add table
      doc.autoTable({
        head: [tableColumnHeaders],
        body: tableBody,
        startY: 45,
        theme: "striped",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [240, 248, 255],
        },
        margin: { top: 45, left: 10, right: 10 },
        didDrawPage: (data) => {
          // Add footer
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
          );
        },
      });
      
      // Save PDF
      doc.save(`${filename}.pdf`);
      console.log("PDF exported successfully!");
      resolve(true);
    } catch (error) {
      console.error("PDF export error:", error);
      reject(error);
    }
  });
};

// Export to Excel
export const exportToExcel = (data, columns, filename) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("Starting Excel export...");
      
      if (!data || data.length === 0) {
        reject(new Error("No data to export"));
        return;
      }
      
      // Prepare worksheet data
      const worksheetData = [
        ["G.S AGATEKO Inventory System"],
        [`Report Generated: ${new Date().toLocaleString()}`],
        [],
        columns.map(col => col.label),
        ...data.map(row => columns.map(col => {
          let value = row[col.key];
          if (value === undefined || value === null) return "-";
          return value;
        }))
      ];
      
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Feeding Report");
      
      // Merge title cells
      if (!worksheet['!merges']) worksheet['!merges'] = [];
      worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } });
      worksheet['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: columns.length - 1 } });
      
      // Auto-size columns
      const maxWidth = columns.map((_, idx) => {
        let max = columns[idx].label.length;
        data.forEach(row => {
          const val = String(row[columns[idx].key] || "-").length;
          if (val > max) max = val;
        });
        return { wch: Math.min(max + 2, 30) };
      });
      worksheet["!cols"] = maxWidth;
      
      XLSX.writeFile(workbook, `${filename}.xlsx`);
      console.log("Excel exported successfully!");
      resolve(true);
    } catch (error) {
      console.error("Excel export error:", error);
      reject(error);
    }
  });
};

// Export to CSV
export const exportToCSV = (data, columns, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const headers = columns.map(col => col.label).join(",");
      const rows = data.map(row => 
        columns.map(col => {
          let value = row[col.key] || "-";
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(",")
      );
      
      const csvContent = [headers, ...rows].join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `${filename}.csv`);
      console.log("CSV exported successfully!");
      resolve(true);
    } catch (error) {
      console.error("CSV export error:", error);
      reject(error);
    }
  });
};