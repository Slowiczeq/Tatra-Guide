<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from "vue";
import { useGlobalStore } from "../../../stores/globalStore";
import { ElMessage } from "element-plus";
const globalStore = useGlobalStore();
import api from "../../../services/api";

const form = reactive({
  email: "",
  password: "",
});

const rules = reactive({
  email: [
    { required: true, message: "Proszę podać email", trigger: "blur" },
    {
      type: "email",
      message: "Proszę podać prawidłowy email",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "Proszę podać hasło", trigger: "blur" },
    {
      min: 8,
      message: "Hasło musi mieć co najmniej 8 znaków",
      trigger: "blur",
    },
  ],
});

const formRef = ref(null);

async function onSubmit() {
  formRef.value.validate(async (valid) => {
    if (valid) {
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
        if (error.response.data) {
          ElMessage.error(error.response.data);
        } else {
          ElMessage.error("Wystąpił błąd podczas logowania");
        }
        form.email = "";
        form.password = "";
      }
    }
  });
}

function handleEnterKey(event) {
  if (event.key === "Enter") {
    onSubmit();
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleEnterKey);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleEnterKey);
});
</script>

<template>
  <div class="login-modal__content">
    <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
      <h2 class="login-modal-title">Logowanie</h2>
      <el-form-item label="Email" prop="email">
        <el-input v-model="form.email" />
      </el-form-item>
      <el-form-item label="Hasło" prop="password">
        <el-input show-password type="password" v-model="form.password" />
      </el-form-item>
      <el-form-item class="modal-login-button-box">
        <el-button class="btn-danger" @click="globalStore.closeLoginModal()">
          Anuluj
        </el-button>
        <el-button class="btn-primary" @click="onSubmit">Zaloguj</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
