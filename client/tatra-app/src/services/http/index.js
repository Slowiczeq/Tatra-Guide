import axios from "axios";
import config from "@/config";
import { useGlobalStore } from "../../stores/globalStore";

const http = axios.create({
  baseURL: config.API_URL,
});

export default http;
export function authHttp() {
  const store = useGlobalStore();
  const token = store.token;

  const authInstance = axios.create({
    baseURL: config.API_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  return authInstance;
}
