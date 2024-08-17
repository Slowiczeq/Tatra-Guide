import axios from "axios";
import config from "@/config";
import { useGlobalStore } from "@/stores/globalStore";

const http = axios.create({
  baseURL: config.API_URL,
});

http.interceptors.request.use(
  (config) => {
    const store = useGlobalStore();
    const token = store.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default http;
