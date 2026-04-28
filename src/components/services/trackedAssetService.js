import API from "./api";

export const getTrackedAssets = () => API.get("/tracked-assets");
export const getAssetStats = () => API.get("/tracked-assets/stats");
export const createTrackedAsset = (data) => API.post("/tracked-assets", data);
export const updateTrackedAsset = (id, data) => API.put(`/tracked-assets/${id}`, data);
export const assignAsset = (id, data) => API.put(`/tracked-assets/${id}/assign`, data);
export const returnAsset = (id) => API.put(`/tracked-assets/${id}/return`);
export const deleteTrackedAsset = (id) => API.delete(`/tracked-assets/${id}`);