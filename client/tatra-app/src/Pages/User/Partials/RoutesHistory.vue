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
} from "element-plus";
import { format } from "date-fns";
import Auth from "../../../components/Login/Auth.vue";
import { RouterLink } from "vue-router";
import { Loading } from "@element-plus/icons-vue";

const globalStore = useGlobalStore();

let userData = ref(null);
const isLoading = ref(true);
const isMobile = ref(window.innerWidth < 768);

window.addEventListener("resize", () => {
  isMobile.value = window.innerWidth < 768;
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

onMounted(() => {
  loadData();
});

const getTrailName = (routeID) => {
  if (userData.value && userData.value.hikingTrails) {
    const trail = userData.value.hikingTrails.find(
      (trail) => trail.id == routeID
    );
    return trail ? trail.trail_name : "Nieznana trasa";
  }
  return "Nieznana trasa";
};

const formatDate = (dateString) => {
  return dateString ? format(new Date(dateString), "yyyy-MM-dd") : "N/A";
};

const formatUserTime = (timeString) => {
  return timeString ? format(new Date(timeString), "HH:mm:ss") : "N/A";
};

const completedTrails = computed(() => {
  if (!userData.value) return [];
  return userData.value.userTrips.flatMap((trip) => {
    return trip.trips.flatMap((routes) => {
      return routes.filter((route) => route.status === "ended");
    });
  });
});
</script>

<template>
  <div class="container">
    <Auth v-if="!globalStore.token" />
    <div v-else>
      <el-card class="completed-trails-card">
        <template #header>
          <div class="header">Ukończone trasy</div>
        </template>
        <div v-if="isLoading" class="loading-container">
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
        </div>
        <el-table
          v-else-if="!isMobile"
          :data="completedTrails"
          style="width: 100%"
          empty-text="Brak ukończonych tras"
        >
          <el-table-column width="190" prop="trailName" label="Nazwa trasy">
            <template #default="{ row }">
              <RouterLink :to="`/route/${row.routeID}`">
                {{ getTrailName(row.routeID) }}
              </RouterLink>
            </template>
          </el-table-column>
          <el-table-column
            width="190"
            prop="routeDist"
            label="Dystans (km)"
            align="center"
          ></el-table-column>
          <el-table-column
            align="center"
            width="190"
            prop="routeTime"
            label="Średni czas"
          ></el-table-column>
          <el-table-column width="190" label="Mój czas" align="center">
            <template #default="{ row }">
              {{ row.userTime }}
            </template>
          </el-table-column>
          <el-table-column
            width="190"
            align="center"
            prop="timeEnd"
            label="Data zakończenia"
            :formatter="(row) => formatDate(row.timeEnd)"
          ></el-table-column>
        </el-table>
        <div v-else class="mobile-completed-trails">
          <div v-for="trail in completedTrails" :key="trail.id" class="trail">
            <p>
              <strong>Nazwa trasy: </strong>
              <RouterLink :to="`/route/${trail.routeID}`">{{
                getTrailName(trail.routeID)
              }}</RouterLink>
            </p>
            <p><strong>Dystans (km): </strong> {{ trail.routeDist }}</p>
            <p><strong>Średni czas: </strong> {{ trail.routeTime }}</p>
            <p><strong>Mój czas: </strong> {{ trail.userTime }}</p>
            <p>
              <strong>Data zakończenia: </strong>
              {{ formatDate(trail.timeEnd) }}
            </p>
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
.user-info-card,
.completed-trails-card,
.completed-trips-card,
.started-trails-card {
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
@media (max-width: 768px) {
  .container {
    margin-top: 20px;
    margin-bottom: 20px;
  }
  .mobile-completed-trails {
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
</style>
