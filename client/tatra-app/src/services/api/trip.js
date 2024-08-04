import http from "@/services/http";

export default {
  startNewTrip(payload) {
    return http.post("/trip/new", payload);
  },
  getTrips(payload) {
    return http.post("/trip/getTrips", payload);
  },
  startRoute(payload) {
    return http.post("/trip/startRoute", payload);
  },
  endRoute(payload) {
    return http.post("/trip/endRoute", payload);
  },
  getTripById(payload) {
    return http.post("/trip/getById", payload);
  },
  updateTrip(payload) {
    return http.post("/trip/update", payload);
  },
  deleteTrip(payload) {
    return http.post("/trip/delete", payload);
  },
};
