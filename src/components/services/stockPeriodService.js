import API from "./api";

export const getStockPeriods = () => API.get("/stock-periods");
export const getActivePeriod = () => API.get("/stock-periods/active");
export const createStockPeriod = (data) => API.post("/stock-periods", data);
export const updateStockPeriod = (id, data) => API.put(`/stock-periods/${id}`, data);
export const setActivePeriod = (id) => API.put(`/stock-periods/${id}/active`);
export const deleteStockPeriod = (id) => API.delete(`/stock-periods/${id}`);