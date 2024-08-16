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
import { Loading } from "@element-plus/icons-vue";

const globalStore = useGlobalStore();

let userData = ref(null);
const isMobile = ref(window.innerWidth < 768);
let isLoading = ref(true); // Dodano zmienną śledzącą stan ładowania

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
      isLoading.value = false; // Zakończenie ładowania
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
        <div v-if="isLoading" class="loading-container">
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
        </div>
        <div v-else class="table-container">
          <el-table v-if="!isMobile" :data="userReviews">
            <el-table-column prop="trailName" label="Nazwa Trasy" width="210">
              <template #default="{ row }">
                <RouterLink :to="`/route/${row.routeID}`">
                  {{ row.trailName }}
                </RouterLink>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="Treść Recenzji" width="390">
            </el-table-column>
            <el-table-column label="Ocena" width="190">
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
              width="150"
              :formatter="(row) => formatDate(row.date)"
            ></el-table-column>
          </el-table>
          <div v-else class="mobile-reviews">
            <div v-for="review in userReviews" :key="review.id" class="review">
              <p>
                <strong>Nazwa Trasy: </strong>
                <RouterLink :to="`/route/${review.routeID}`">{{
                  review.trailName
                }}</RouterLink>
              </p>
              <p><strong>Treść Recenzji: </strong> {{ review.content }}</p>
              <p class="review-p-box">
                <strong>Ocena: </strong>
                <span class="stars">
                  <el-icon
                    v-for="(star, index) in renderStars(review.rating)"
                    :key="index"
                    style="font-size: 24px; color: #f7ba2a"
                  >
                    <component :is="star" />
                  </el-icon>
                </span>
              </p>
              <p><strong>Data: </strong> {{ formatDate(review.date) }}</p>
            </div>
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
  margin-bottom: 20px;
  text-align: center;
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
.mobile-reviews {
  display: none;
}
.review {
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

  .mobile-reviews {
    display: block;
  }
  .table-container .el-table {
    display: none;
  }
  .review-p-box {
    display: flex;
    align-items: center;
  }
}
a {
  color: #000;
  text-decoration: unset;
}
</style>
