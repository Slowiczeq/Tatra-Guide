<script setup>
import { useGlobalStore } from "../../stores/globalStore";
import api from "../../services/api";
import { ref, onMounted, computed } from "vue";
import { ElMessage, ElCard, ElIcon } from "element-plus";
import Auth from "../../components/Login/Auth.vue";
import { Loading } from "@element-plus/icons-vue";

const globalStore = useGlobalStore();

let userData = ref(null);
let isLoading = ref(true); // Dodano zmienną śledzącą stan ładowania

async function loadData() {
  if (globalStore.token) {
    try {
      const response = await api.auth.userInfo(globalStore.userID);
      userData.value = response.data;
      console.log(userData.value);
    } catch (error) {
      ElMessage.error("Błąd ładowania danych");
    } finally {
      isLoading.value = false; // Zakończenie ładowania
    }
  }
}

const totalEndedTrips = computed(() => {
  if (!userData.value) return 0;
  return userData.value.userTrips.reduce((count, trip) => {
    return (
      count +
      trip.trips.reduce((tripCount, routes) => {
        return (
          tripCount +
          routes.reduce((routeCount, route) => {
            return routeCount + (route.status === "ended" ? 1 : 0);
          }, 0)
        );
      }, 0)
    );
  }, 0);
});

const totalDistance = computed(() => {
  if (!userData.value) return 0;
  return userData.value.userTrips
    .reduce((distance, trip) => {
      return (
        distance +
        trip.trips.reduce((tripDistance, routes) => {
          return (
            tripDistance +
            routes.reduce((routeDistance, route) => {
              return (
                routeDistance +
                (route.status === "ended" ? parseFloat(route.routeDist) : 0)
              );
            }, 0)
          );
        }, 0)
      );
    }, 0)
    .toFixed(2);
});

const totalChallenges = computed(() => {
  if (!userData.value) return 0;
  return userData.value.userChallenges.filter(
    (challenge) => challenge.status === "zakończono"
  ).length;
});

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="container">
    <Auth v-if="!globalStore.token" />
    <div v-else>
      <div v-if="isLoading" class="loading-container">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
      </div>
      <el-card v-else class="user-info-card">
        <template #header>
          <div class="header">
            {{ globalStore.userFirstName }} {{ globalStore.userLastName }}
          </div>
        </template>
        <div class="user-info-item">
          <strong>Email:</strong> {{ globalStore.userEmail }}
        </div>
        <div v-if="userData">
          <div class="user-info-item">
            <strong>Ilość tras:</strong> {{ totalEndedTrips }}
          </div>
          <div class="user-info-item">
            <strong>Łączny dystans:</strong> {{ totalDistance }} km
          </div>
          <div class="user-info-item">
            <strong>Wykonane wyzwania:</strong> {{ totalChallenges }}
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 700px;
  margin: auto;
}

.header {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.user-info-card {
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 40px;
}

.user-info-item {
  margin-bottom: 10px;
  font-size: 16px;
}

.user-info-item strong {
  font-weight: bold;
  color: #333;
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
}
</style>
