import http from "@/services/http";

export default {
  challengesList() {
    return http.get("/challenges/list");
  },
  startChallenge(payload) {
    return http.post("/challenges/start", payload);
  },
  userChallenges(payload) {
    return http.post("/challenges/user", payload);
  },
};
