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
import { Star, StarFilled } from "@element-plus/icons-vue";
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
    } catch (error) {
      ElMessage.error("Błąd ładowania danych");
    }
  }
}

onMounted(() => {
  loadData();
});

const userReviews = computed(() => {
  if (!userData.value) return [];

  return userData.value.userReviews.map((review) => {
    const trail = userData.value.hikingTrails.find(
      (trail) => trail.id == review.routeID
    );
    return {
      ...review,
      trailName: trail ? trail.trail_name : "Nieznana trasa",
    };
  });
});

const formatDate = (dateString) => {
  return dateString ? format(new Date(dateString), "yyyy-MM-dd HH:mm") : "N/A";
};

function renderStars(rating) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(i <= rating ? StarFilled : Star);
  }
  return stars;
}
</script>

<template>
  <div class="container">
    <Auth v-if="!globalStore.token" />
    <div v-else>
      <el-card class="reviews-card">
        <div class="header">Moje Recenzje</div>
        <el-table :data="userReviews">
          <el-table-column prop="trailName" label="Nazwa Trasy">
            <template #default="{ row }">
              <RouterLink :to="`/route/${row.routeID}`">
                {{ row.trailName }}
              </RouterLink>
            </template>
          </el-table-column>
          <el-table-column
            prop="content"
            label="Treść Recenzji"
          ></el-table-column>
          <el-table-column label="Ocena">
            <template #default="{ row }">
              <div class="stars">
                <el-icon
                  v-for="(star, index) in renderStars(row.rating)"
                  :key="index"
                  style="font-size: 24px; color: #f7ba2a"
                >
                  <component :is="star" />
                </el-icon>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="date"
            label="Data"
            :formatter="(row) => formatDate(row.date)"
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
}
.reviews-card {
  margin-bottom: 20px;
}
.stars {
  display: flex;
}
</style>
