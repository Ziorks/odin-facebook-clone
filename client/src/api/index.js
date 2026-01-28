import axios from "axios";
const host = import.meta.env.VITE_API_HOST;

export const createNewApiInstance = () => {
  return axios.create({
    baseURL: host,
  });
};

const api = createNewApiInstance();

export default api;
