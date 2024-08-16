<script lang="ts" setup>
import { ref } from "vue";
import { useGlobalStore } from "../stores/globalStore";

const globalStore = useGlobalStore();
const isMobile = ref(false);
const drawer = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 1040;
};

checkMobile();

window.addEventListener("resize", checkMobile);
</script>

<template>
  <header>
    <el-menu
      v-show="!isMobile"
      class="page-menu"
      mode="horizontal"
      background-color="#EDE8DA"
      text-color="#000"
      :ellipsis="false"
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
      <el-menu-item style="margin-left: auto">
        <RouterLink to="/blog">Blog</RouterLink>
      </el-menu-item>

      <el-sub-menu v-if="globalStore.token">
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
          ><RouterLink to="/user/saved-routes" @click="drawer = false"
            >Zapisane trasy</RouterLink
          ></el-menu-item
        >
        <el-menu-item
          ><RouterLink to="/user/trips"
            >Moje wycieczki</RouterLink
          ></el-menu-item
        >
        <el-menu-item @click="globalStore.userLogout()">Wyloguj</el-menu-item>
      </el-sub-menu>
      <el-menu-item v-if="!globalStore.token" class="menu-sign-in">
        <el-button @click="globalStore.openLoginModal()" class="btn-primary"
          >Zaloguj się
        </el-button>
      </el-menu-item>
    </el-menu>
    <el-menu
      v-show="isMobile"
      class="page-menu page-menu-mobile"
      mode="horizontal"
      background-color="#EDE8DA"
      text-color="#000"
      :ellipsis="false"
    >
      <el-menu-item class="menu-title">
        <RouterLink to="/">Tatra Guide</RouterLink>
      </el-menu-item>
      <el-menu-item class="menu-hamburger">
        <el-icon @click="drawer = true" class="hamburger-icon"
          ><Menu
        /></el-icon>
      </el-menu-item>
    </el-menu>

    <el-drawer
      class="drawer-menu-box"
      v-model="drawer"
      direction="ltr"
      size="300px"
    >
      <el-menu
        class="drawer-menu"
        mode="vertical"
        background-color="#EDE8DA"
        text-color="#000"
        :ellipsis="false"
      >
        <el-menu-item class="menu-title">
          <RouterLink to="/" @click="drawer = false">Tatra Guide</RouterLink>
        </el-menu-item>
        <el-menu-item>
          <RouterLink to="/discover" @click="drawer = false"
            >Odkrywaj</RouterLink
          >
        </el-menu-item>
        <el-menu-item>
          <RouterLink to="/routes" @click="drawer = false"
            >Wyszukaj trasę</RouterLink
          >
        </el-menu-item>
        <el-menu-item>
          <RouterLink to="/trip" @click="drawer = false"
            >Zaplanuj wycieczkę</RouterLink
          >
        </el-menu-item>
        <el-menu-item>
          <RouterLink to="/challenges" @click="drawer = false"
            >Podejmij wyzwanie</RouterLink
          >
        </el-menu-item>
        <el-menu-item>
          <RouterLink to="/blog" @click="drawer = false">Blog</RouterLink>
        </el-menu-item>

        <el-sub-menu v-if="globalStore.token">
          <template #title>
            <span class="mobile-menu-user" @click="drawer = true">
              <el-icon><UserFilled /></el-icon>{{ globalStore.userFirstName }}
              {{ globalStore.userLastName }}
            </span>
          </template>
          <el-menu-item
            ><RouterLink to="/user" @click="drawer = false"
              >Profil</RouterLink
            ></el-menu-item
          >
          <el-menu-item
            ><RouterLink to="/user/reviews" @click="drawer = false"
              >Recenzje</RouterLink
            ></el-menu-item
          >
          <el-menu-item
            ><RouterLink to="/user/challenges" @click="drawer = false"
              >Wyzwania</RouterLink
            ></el-menu-item
          >
          <el-menu-item
            ><RouterLink to="/user/history" @click="drawer = false"
              >Historia tras</RouterLink
            ></el-menu-item
          >
          <el-menu-item
            ><RouterLink to="/user/saved-routes" @click="drawer = false"
              >Zapisane trasy</RouterLink
            ></el-menu-item
          >
          <el-menu-item
            ><RouterLink to="/user/trips" @click="drawer = false"
              >Moje wycieczki</RouterLink
            ></el-menu-item
          >
          <el-menu-item
            @click="
              globalStore.userLogout();
              drawer = false;
            "
            >Wyloguj</el-menu-item
          >
        </el-sub-menu>
        <el-menu-item class="menu-sign-in">
          <el-button
            v-if="!globalStore.token"
            @click="
              globalStore.openLoginModal();
              drawer = false;
            "
            class="btn-primary"
            >Zaloguj się
          </el-button>
        </el-menu-item>
      </el-menu>
    </el-drawer>
  </header>
</template>

<style scoped>
.page-menu {
  width: 100%;
}
.hamburger-icon {
  font-size: 24px;
  cursor: pointer;
}
.drawer-menu {
  width: 100%;
}
@media (max-width: 1040px) {
  .page-menu {
    display: none;
  }
  .page-menu-mobile {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
