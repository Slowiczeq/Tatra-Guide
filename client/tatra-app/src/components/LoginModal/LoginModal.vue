<script lang="ts" setup>
import { reactive, ref } from "vue";
import Login from "./Partials/Login.vue";
import Register from "./Partials/Register.vue";
import { useGlobalStore } from "../../stores/globalStore";
const globalStore = useGlobalStore();

const activeName = ref("login");
</script>
<template>
  <el-dialog
    class="login-modal"
    v-model="globalStore.loginModalActive"
    width="500"
  >
    <el-tabs v-model="activeName">
      <el-tab-pane label="Logowanie" name="login">
        <Login />
      </el-tab-pane>
      <el-tab-pane label="Rejestracja" name="register">
        <Register />
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>
