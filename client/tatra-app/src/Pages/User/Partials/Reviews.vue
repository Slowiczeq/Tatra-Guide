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
        <div class="table-container">
          <el-table :data="userReviews">
            <el-table-column prop="trailName" label="Nazwa Trasy" width="240">
              <template #default="{ row }">
                <RouterLink :to="`/route/${row.routeID}`">
                  {{ row.trailName }}
                </RouterLink>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="Treść Recenzji" width="300">
            </el-table-column>
            <el-table-column label="Ocena" width="220">
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
              width="180"
              :formatter="(row) => formatDate(row.date)"
            ></el-table-column>
          </el-table>
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
}
.reviews-card {
  margin-bottom: 20px;
}
.stars {
  display: flex;
}
.table-container {
  overflow-x: auto;
}
@media (max-width: 768px) {
  .container {
    padding: 10px;
  }

  .header {
    font-size: 16px;
    text-align: center;
  }

  .el-card {
    padding: 10px;
  }

  .el-table {
    font-size: 14px;
  }

  .stars {
    justify-content: center;
  }
}
</style>
