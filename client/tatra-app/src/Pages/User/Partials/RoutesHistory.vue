<script setup>
import { useGlobalStore } from "../../../stores/globalStore";
import api from "../../../services/api";
import { ref, onMounted, computed } from "vue";
import { ElMessage, ElCard, ElTable, ElTableColumn } from "element-plus";
import { format } from "date-fns";
import Auth from "../../../components/Login/Auth.vue";
import { RouterLink } from "vue-router";

const globalStore = useGlobalStore();

let userData = ref(null);

async function loadData() {
  if (globalStore.token) {
    try {
      const response = await api.auth.userInfo(globalStore.userID);
      userData.value = response.data;
      console.log(userData.value);
    } catch (error) {
      ElMessage.error("Błąd ładowania danych");
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
  return dateString ? format(new Date(dateString), "yyyy-MM-dd HH:mm") : "N/A";
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
        <el-table :data="completedTrails" style="width: 100%">
          <el-table-column prop="trailName" label="Nazwa trasy">
            <template #default="{ row }">
              <RouterLink :to="`/route/${row.routeID}`">
                {{ getTrailName(row.routeID) }}
              </RouterLink>
            </template>
          </el-table-column>
          <el-table-column
            prop="routeDist"
            label="Dystans (km)"
          ></el-table-column>
          <el-table-column
            prop="routeTime"
            label="Średni czas"
          ></el-table-column>
          <el-table-column label="Mój czas">
            <template #default="{ row }">
              {{ formatUserTime(row.userTime) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="timeEnd"
            label="Czas zakończenia"
            :formatter="(row) => formatDate(row.timeEnd)"
          ></el-table-column>
        </el-table>
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
</style>
