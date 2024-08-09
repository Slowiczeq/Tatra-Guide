import http from "@/services/http";

export default {
  loadBlogs() {
    return http.get("/blog/list");
  },

  loadBlog(id) {
    return http.get(`/blog/details/${id}`);
  },
};
