import API from "./api";

export const getBooks = () => API.get("/library");
export const getBookById = (id) => API.get(`/library/${id}`);
export const createBook = (data) => API.post("/library", data);
export const updateBook = (id, data) => API.put(`/library/${id}`, data);
export const deleteBook = (id) => API.delete(`/library/${id}`);
export const getBooksBySubject = (subject) => API.get(`/library/subject/${subject}`);
export const getBooksByType = (bookType) => API.get(`/library/type/${bookType}`);