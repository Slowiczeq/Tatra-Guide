<script setup>
import { RouterLink, RouterView } from "vue-router";
import Menu from "./components/Menu.vue";
import Footer from "./components/Footer.vue";
import LoginModal from "./components/LoginModal/LoginModal.vue";
import { ref, onMounted, computed } from "vue";
import api from "./services/api";

import { useGlobalStore } from "./stores/globalStore";
const globalStore = useGlobalStore();

const verifyToken = async () => {
  if (globalStore.token) {
    try {
      await api.auth.verifyToken();
      globalStore.setTokenVerified();
    } catch (error) {
      globalStore.userLogout();
    }
  }
};

onMounted(() => {
  verifyToken();
});
</script>

<template>
  <div class="wrapper">
    <Menu />
    <RouterView />
    <Footer />
    <LoginModal v-if="globalStore.loginModalActive" />
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
