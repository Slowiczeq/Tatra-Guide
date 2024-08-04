import api from "@/services/api";

export const ApiPlugin = {
  install(app) {
    app.config.globalProperties.$api = api;
  },
};
