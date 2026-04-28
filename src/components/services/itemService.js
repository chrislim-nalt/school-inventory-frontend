import API from "./api";

export const getItems = () => API.get("/items");
export const getItemById = (id) => API.get(`/items/${id}`);
export const createItem = (data) => API.post("/items", data);
export const updateItem = (id, data) => API.put(`/items/${id}`, data);
export const deleteItem = (id) => API.delete(`/items/${id}`);
export const getItemsByCategory = (id) => API.get(`/items/category/${id}`);