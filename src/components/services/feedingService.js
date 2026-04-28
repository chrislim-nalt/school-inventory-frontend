import API from "./api";

export const getRecords = () => API.get("/feeding/records");
export const createRecord = (data) => API.post("/feeding/records", data);
export const updateRecord = (id, data) => API.put(`/feeding/records/${id}`, data);
export const deleteRecord = (id) => API.delete(`/feeding/records/${id}`);
export const getStockSummary = () => API.get("/feeding/stock-summary");
export const getDashboardStats = () => API.get("/feeding/dashboard-stats");
export const generateReport = (data) => API.post("/feeding/generate-report", data);