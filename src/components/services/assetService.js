import API from "./api";

export const getAssets = () => API.get("/assets");
export const getAssetById = (id) => API.get(`/assets/${id}`);
export const createAsset = (data) => API.post("/assets", data);
export const updateAsset = (id, data) => API.put(`/assets/${id}`, data);
export const deleteAsset = (id) => API.delete(`/assets/${id}`);
export const getAssetsByLocation = (location) => API.get(`/assets/location/${location}`);
export const getAssetsByType = (assetType) => API.get(`/assets/type/${assetType}`);
export const getAssetSummary = () => API.get(`/assets/summary`);