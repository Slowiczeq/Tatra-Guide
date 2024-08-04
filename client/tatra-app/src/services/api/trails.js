import http from "@/services/http";

export default {
  loadTrails() {
    return http.get("/hiking-trails/list");
  },

  loadTrail(id) {
    return http.get(`/hiking-trails/details/${id}`);
  },
  checkUser(payload) {
    return http.post("/trails/user-check", payload);
  },
  saveTrail(payload) {
    return http.post("/trails/save", payload);
  },
  deleteTrail(payload) {
    return http.post("/trails/delete", payload);
  },
  userTrails(payload) {
    return http.post("/trails/user-trails", payload);
  },
};
