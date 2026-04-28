import API from "./api";

export const getProjectedNeeds = (params) => API.get("/projected-needs", { params });
export const createProjectedNeed = (data) => API.post("/projected-needs", data);
export const updateProjectedNeed = (id, data) => API.put(`/projected-needs/${id}`, data);
export const deleteProjectedNeed = (id) => API.delete(`/projected-needs/${id}`);