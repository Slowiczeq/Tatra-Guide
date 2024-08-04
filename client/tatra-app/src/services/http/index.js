import axios from "axios";
import config from "@/config";

const http = axios.create({
  baseURL: config.API_URL,
});

export default http;
