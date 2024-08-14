<script setup>
import { reactive, ref } from "vue";
import { useGlobalStore } from "../../../stores/globalStore";
import { ElMessage } from "element-plus";
const globalStore = useGlobalStore();
import api from "../../../services/api";

const form = reactive({
  email: "",
  password: "",
});
console.log(form);
async function onSubmit() {
  try {
    const response = await api.auth.login(form);
    ElMessage({
      message: "Zalogowany",
      type: "success",
    });
    globalStore.userLogged(response.data);
    form.email = "";
    form.password = "";
    globalStore.closeLoginModal();
    window.location.reload();
  } catch (error) {
    console.log(error);
    ElMessage.error(error.response.data);
    form.email = "";
    form.password = "";
  }
}
</script>
<template>
  <div class="login-modal__content">
    <el-form :model="form" label-position="top">
      <el-form-item label="Email">
        <el-input v-model="form.email" />
      </el-form-item>
      <el-form-item label="Hasło">
        <el-input show-password type="password" v-model="form.password" />
      </el-form-item>
      <el-form-item class="modal-login-button-box">
        <el-button class="btn-primary" @click="onSubmit">Zaloguj</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
