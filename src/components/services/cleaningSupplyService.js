import API from "./api";

export const getCleaningSupplies = () => API.get("/cleaning-supplies");
export const getCleaningSupplyById = (id) => API.get(`/cleaning-supplies/${id}`);
export const createCleaningSupply = (data) => API.post("/cleaning-supplies", data);
export const updateCleaningSupply = (id, data) => API.put(`/cleaning-supplies/${id}`, data);
export const deleteCleaningSupply = (id) => API.delete(`/cleaning-supplies/${id}`);
export const getLowStockSupplies = () => API.get("/cleaning-supplies/low-stock");
export const updateStock = (id, quantity) => API.put(`/cleaning-supplies/${id}/stock`, { quantity });