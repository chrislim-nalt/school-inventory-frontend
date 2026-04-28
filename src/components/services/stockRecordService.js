import API from "./api";

export const getStockRecords = (params) => API.get("/stock-records", { params });
export const getStockRecordById = (id) => API.get(`/stock-records/${id}`);
export const createStockRecord = (data) => API.post("/stock-records", data);
export const updateStockRecord = (id, data) => API.put(`/stock-records/${id}`, data);
export const deleteStockRecord = (id) => API.delete(`/stock-records/${id}`);
export const getPeriodSummary = (periodId) => API.get(`/stock-records/summary/${periodId}`);