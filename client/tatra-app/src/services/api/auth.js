import http from "@/services/http";

export default {
  login(payload) {
    return http.post("/auth/user-login", payload);
  },
  register(payload) {
    return http.post("/auth/register", payload);
  },
  userInfo(payload) {
    return http.post("/user-info", {
      id: payload,
    });
  },
};
