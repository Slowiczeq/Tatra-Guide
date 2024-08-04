<script setup>
import { useGlobalStore } from "../../../stores/globalStore";
import api from "../../../services/api";
import { ref, onMounted, computed } from "vue";
import { ElMessage, ElCard, ElTable, ElTableColumn } from "element-plus";
import { format } from "date-fns";
import Auth from "../../../components/Login/Auth.vue";
import { RouterLink } from "vue-router";
import UserTrips from "../../Trip/Partials/UserTrips.vue";

const globalStore = useGlobalStore();
</script>

<template>
  <div class="container">
    <Auth v-if="!globalStore.token" />
    <div v-else>
      <el-card class="completed-trips-card">
        <UserTrips />
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
}
.header {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}
.user-info-card,
.completed-trails-card,
.completed-trips-card,
.started-trails-card {
  margin-bottom: 20px;
}
</style>
