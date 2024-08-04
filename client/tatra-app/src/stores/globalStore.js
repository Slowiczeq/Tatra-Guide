import { defineStore } from "pinia";

export const useGlobalStore = defineStore("globalStore", {
  state: () => ({
    userID: localStorage.getItem("userID"),
    userFirstName: localStorage.getItem("userFirstName"),
    userLastName: localStorage.getItem("userLastName"),
    userEmail: localStorage.getItem("userEmail"),
    token: localStorage.getItem("token"),
    loginModalActive: false,
  }),
  actions: {
    openLoginModal() {
      this.loginModalActive = true;
    },
    closeLoginModal() {
      this.loginModalActive = false;
    },
    userLogged(data) {
      console.log(data);
      this.userID = data.id;
      this.userFirstName = data.firstName;
      this.userLastName = data.lastName;
      this.userEmail = data.email;
      this.token = data.token;
      localStorage.setItem("userID", data.id);
      localStorage.setItem("userFirstName", data.firstName);
      localStorage.setItem("userLastName", data.lastName);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("token", data.token);
    },
    userLogout() {
      this.userID = "";
      this.userFirstName = "";
      this.userLastName = "";
      this.userEmail = "";
      this.token = "";
      localStorage.removeItem("userID");
      localStorage.removeItem("userFirstName");
      localStorage.removeItem("userLastName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("token");
      window.location.reload();
    },
  },
  getters: {},
});
