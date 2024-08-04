<script setup>
import { RouterLink, RouterView } from "vue-router";
import Menu from "./components/Menu.vue";
import Footer from "./components/Footer.vue";
import LoginModal from "./components/LoginModal/LoginModal.vue";

import { useGlobalStore } from "./stores/globalStore";
const globalStore = useGlobalStore();
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
