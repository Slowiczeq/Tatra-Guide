<script setup>
import SearchSlider from "./Partials/SearchSlider.vue";
import PopularRoutes from "./Partials/PopularRoutes.vue";
import DiscoverRoutes from "./Partials/DiscoverRoutes.vue";
import ChallengesSection from "./Partials/ChallengesSection.vue";
import ReviewsSection from "./Partials/ReviewsSection.vue";
import BlogSection from "./Partials/BlogSection.vue";
import { ref, onMounted } from "vue";
import api from "../../services/api";
import { Loading } from "@element-plus/icons-vue";

let trailsData = ref([]);
let isLoading = ref(true);

async function loadTrails() {
  try {
    const response = await api.trails.loadTrails();
    trailsData.value = response.data;
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadTrails();
});
</script>

<template>
  <div v-if="isLoading" class="loading-container">
    <el-icon class="is-loading">
      <Loading />
    </el-icon>
  </div>

  <div class="home-page" v-else-if="trailsData.length">
    <SearchSlider :trailsData="trailsData" />
    <PopularRoutes :trailsData="trailsData" />
    <DiscoverRoutes />
    <ChallengesSection />
    <ReviewsSection :trailsData="trailsData" />
    <BlogSection />
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500px;
}
</style>
