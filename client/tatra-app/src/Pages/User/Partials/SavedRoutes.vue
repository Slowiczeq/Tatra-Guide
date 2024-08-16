<script setup>
import { useGlobalStore } from "../../../stores/globalStore";
import api from "../../../services/api";
import { ref, onMounted, computed } from "vue";
import {
  ElMessage,
  ElCard,
  ElTable,
  ElTableColumn,
  ElIcon,
  ElButton,
} from "element-plus";
import { format } from "date-fns";
import Auth from "../../../components/Login/Auth.vue";
import { RouterLink } from "vue-router";
import { Loading } from "@element-plus/icons-vue";

const globalStore = useGlobalStore();

let userTrailsData = ref([]);
let userData = ref(null);

const isLoading = ref(true);
const isMobile = ref(window.innerWidth < 1040);

window.addEventListener("resize", () => {
  isMobile.value = window.innerWidth < 1040;
});

async function loadData() {
  if (globalStore.token) {
    try {
      const response = await api.auth.userInfo(globalStore.userID);
      userData.value = response.data;
    } catch (error) {
      ElMessage.error("Błąd ładowania danych");
    } finally {
      isLoading.value = false;
    }
  }
}

async function loadUserTrails() {
  if (globalStore.token) {
    try {
      const payload = { userID: globalStore.userID };
      const response = await api.trails.userTrails(payload);
      userTrailsData.value = response.data;
    } catch (error) {
      ElMessage.error("Błąd ładowania tras użytkownika");
    }
  }
}

async function deleteTrail(id) {
  const payload = {
    userID: globalStore.userID,
    routeID: id,
  };
  try {
    const response = await api.trails.deleteTrail(payload);
    userTrailsData.value = response.data;
    ElMessage.success("Trasa usunięta");
  } catch (error) {
    ElMessage.error("Błąd podczas usuwania trasy");
  }
}

onMounted(() => {
  loadData();
  loadUserTrails();
});

const getTrailInfo = (routeID, field) => {
  if (userData.value && userData.value.hikingTrails) {
    const trail = userData.value.hikingTrails.find(
      (trail) => trail.id == routeID
    );
    return trail ? trail[field] : "N/A";
  }
  return "N/A";
};

const savedTrails = computed(() => {
  if (!userTrailsData.value || !userData.value) return [];
  return userTrailsData.value.map((trail) => ({
    ...trail,
    trailName: getTrailInfo(trail.routeID, "trail_name"),
    routeDist: getTrailInfo(trail.routeID, "route_length"),
    routeTime: getTrailInfo(trail.routeID, "route_time"),
    difficultyLevel: getTrailInfo(trail.routeID, "difficulty_level"),
  }));
});
</script>

<template>
  <div class="container">
    <Auth v-if="!globalStore.token" />
    <div v-else>
      <el-card class="saved-trails-card">
        <template #header>
          <div class="header">Zapisane trasy</div>
        </template>
        <div v-if="isLoading" class="loading-container">
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
        </div>
        <el-table
          empty-text="Brak zapisanych tras"
          v-else-if="!isMobile"
          :data="savedTrails"
          style="width: 100%"
        >
          <el-table-column width="310" prop="trailName" label="Nazwa trasy">
            <template #default="{ row }">
              <RouterLink :to="`/route/${row.routeID}`">
                {{ row.trailName }}
              </RouterLink>
            </template>
          </el-table-column>
          <el-table-column
            width="190"
            prop="routeDist"
            label="Dystans (km)"
          ></el-table-column>
          <el-table-column
            width="190"
            prop="routeTime"
            label="Średni czas"
          ></el-table-column>
          <el-table-column
            width="190"
            prop="difficultyLevel"
            label="Poziom trudności"
          ></el-table-column>
          <el-table-column width="70" label="">
            <template #default="{ row }">
              <el-button
                type="danger"
                size="small"
                @click="deleteTrail(row.routeID)"
              >
                Usuń
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="mobile-saved-trails">
          <div v-for="trail in savedTrails" :key="trail.routeID" class="trail">
            <p>
              <strong>Nazwa trasy: </strong>
              <RouterLink :to="`/route/${trail.routeID}`">{{
                trail.trailName
              }}</RouterLink>
            </p>
            <p><strong>Dystans (km): </strong> {{ trail.routeDist }}</p>
            <p><strong>Średni czas: </strong> {{ trail.routeTime }}</p>
            <p>
              <strong>Poziom trudności: </strong> {{ trail.difficultyLevel }}
            </p>
            <el-button
              type="danger"
              size="small"
              @click="deleteTrail(trail.routeID)"
            >
              Usuń
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
}
.header {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}
.saved-trails-card {
  margin-bottom: 20px;
}
.trail {
  border-bottom: 1px solid #ebeef5;
  padding: 10px 0;
}
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
@media (max-width: 1040px) {
  .container {
    margin-top: 20px;
    margin-bottom: 20px;
  }
  .mobile-saved-trails {
    display: block;
  }
  .el-table {
    display: none;
  }
}
a {
  color: #000;
  text-decoration: unset;
}
.mobile-saved-trails p {
  margin-bottom: 5px;
}
</style>
