<script setup>
import { reactive, ref } from "vue";
import { useGlobalStore } from "../../../stores/globalStore";
const globalStore = useGlobalStore();
import { ElMessage } from "element-plus";
import api from "../../../services/api";

const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
});

const rules = reactive({
  firstName: [
    { required: true, message: "Proszę podać imię", trigger: "blur" },
  ],
  lastName: [
    { required: true, message: "Proszę podać nazwisko", trigger: "blur" },
  ],
  email: [
    { required: true, message: "Proszę podać email", trigger: "blur" },
    {
      type: "email",
      message: "Nieprawidłowy format email",
      trigger: ["blur", "change"],
    },
  ],
  password: [
    { required: true, message: "Proszę podać hasło", trigger: "blur" },
    {
      min: 8,
      message: "Hasło musi zawierać co najmniej 8 znaków",
      trigger: "blur",
    },
  ],
});

const formRef = ref(null);

async function onSubmit() {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await api.auth.register(form);
        ElMessage({
          message: "Konto utworzone pomyślnie",
          type: "success",
        });
        globalStore.userLogged(response.data);
        globalStore.closeLoginModal();
        window.location.reload();
        form.firstName = "";
        form.lastName = "";
        form.email = "";
        form.password = "";
      } catch (error) {
        console.log(error.response.data);
        if (error.response.data) {
          ElMessage.error(error.response.data);
        } else {
          ElMessage.error("Wystąpił bład podczas rejestracji");
        }
      }
    } else {
      ElMessage.error("Wystąpił bład podczas rejestracji");
    }
  });
}
</script>

<template>
  <div class="login-modal__content">
    <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
      <el-form-item label="Imię" prop="firstName">
        <el-input v-model="form.firstName" />
      </el-form-item>
      <el-form-item label="Nazwisko" prop="lastName">
        <el-input v-model="form.lastName" />
      </el-form-item>
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
        <el-button class="btn-primary" @click="onSubmit">Zarejestruj</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
