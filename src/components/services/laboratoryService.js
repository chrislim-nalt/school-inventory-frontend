import API from "./api";

export const getLaboratoryItems = () => API.get("/laboratory");
export const getLaboratoryItemById = (id) => API.get(`/laboratory/${id}`);
export const createLaboratoryItem = (data) => API.post("/laboratory", data);
export const updateLaboratoryItem = (id, data) => API.put(`/laboratory/${id}`, data);
export const deleteLaboratoryItem = (id) => API.delete(`/laboratory/${id}`);
export const getExpiredChemicals = () => API.get("/laboratory/expired");
export const getLowStockLabItems = () => API.get("/laboratory/low-stock");