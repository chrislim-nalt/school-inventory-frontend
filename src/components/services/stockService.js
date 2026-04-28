import API from "./api";

export const getTransactions = () => API.get("/stock");
export const getBorrowedItems = () => API.get("/stock/borrowed");
export const createTransaction = (data) => API.post("/stock", data);
export const updateTransaction = (id, data) => API.put(`/stock/${id}`, data);
export const deleteTransaction = (id) => API.delete(`/stock/${id}`);
export const returnBorrowedItem = (id) => API.put(`/stock/${id}/return`);
export const getItemTransactions = (id) => API.get(`/stock/item/${id}`);