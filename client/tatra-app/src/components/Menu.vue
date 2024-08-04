<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useGlobalStore } from "../stores/globalStore";

const globalStore = useGlobalStore();
const isEllipsis = ref(false);

const handleResize = () => {
  isEllipsis.value = window.innerWidth < 768;
};

onMounted(() => {
  handleResize();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <header>
    <el-menu
      class="page-menu"
      mode="horizontal"
      background-color="#EDE8DA"
      text-color="#000"
      :ellipsis="isEllipsis"
    >
      <el-menu-item class="menu-title">
        <RouterLink to="/">Tatra Guide</RouterLink>
      </el-menu-item>
      <el-menu-item>
        <RouterLink to="/discover">Odkrywaj</RouterLink>
      </el-menu-item>
      <el-menu-item>
        <RouterLink to="/routes">Wyszukaj trasę</RouterLink>
      </el-menu-item>
      <el-menu-item>
        <RouterLink to="/trip">Zaplanuj wycieczkę</RouterLink>
      </el-menu-item>
      <el-menu-item>
        <RouterLink to="/challenges">Podejmij wyzwanie</RouterLink>
      </el-menu-item>
      <!-- <el-menu-item>
        <RouterLink to="blog">Blog</RouterLink>
      </el-menu-item> -->

      <el-sub-menu style="margin-left: auto" v-if="globalStore.token">
        <template #title>
          <RouterLink to="/user"
            ><el-icon><UserFilled /></el-icon>{{ globalStore.userFirstName }}
            {{ globalStore.userLastName }}</RouterLink
          >
        </template>
        <el-menu-item><RouterLink to="/user">Profil</RouterLink></el-menu-item>
        <el-menu-item
          ><RouterLink to="/user/reviews">Recenzje</RouterLink></el-menu-item
        >
        <el-menu-item
          ><RouterLink to="/user/challenges">Wyzwania</RouterLink></el-menu-item
        >
        <el-menu-item
          ><RouterLink to="/user/history"
            >Historia tras</RouterLink
          ></el-menu-item
        >
        <el-menu-item
          ><RouterLink to="/user/trips"
            >Moje wycieczki</RouterLink
          ></el-menu-item
        >
        <el-menu-item @click="globalStore.userLogout()">Wyloguj</el-menu-item>
      </el-sub-menu>
      <el-menu-item class="menu-sign-in">
        <el-button
          v-if="!globalStore.token"
          @click="globalStore.openLoginModal()"
          class="btn-primary"
          >Zaloguj się
        </el-button>
      </el-menu-item>
    </el-menu>
  </header>
</template>
<style scoped>
header {
  max-width: 360px;
}
</style>
