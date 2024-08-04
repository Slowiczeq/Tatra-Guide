import http from "@/services/http";

export default {
  submitReview(payload) {
    return http.post("/reviews/create", payload);
  },
  getReviewsByRoute(payload) {
    return http.post("/reviews/getByRoute", payload);
  },
  getReviews() {
    return http.get("/reviews/list");
  },
};
