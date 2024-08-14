<script lang="ts" setup>
import { reactive, ref } from "vue";
import Login from "./Partials/Login.vue";
import Register from "./Partials/Register.vue";
import { useGlobalStore } from "../../stores/globalStore";
const globalStore = useGlobalStore();

const activeName = ref("login");
</script>

<template>
  <div class="user-sign-container">
    <el-card class="user-sign-card" shadow="always">
      <el-tabs v-model="activeName">
        <el-tab-pane label="Logowanie" name="login">
          <Login v-if="activeName === 'login'" />
        </el-tab-pane>
        <el-tab-pane label="Rejestracja" name="register">
          <Register v-if="activeName === 'register'" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
.user-sign-card {
  width: 600px;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.el-tabs__header {
  justify-content: center;
}

.el-tab-pane {
  margin-top: 20px;
}
</style>
