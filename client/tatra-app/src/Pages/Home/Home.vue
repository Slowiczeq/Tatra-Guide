<script setup>
import SearchSlider from "./Partials/SearchSlider.vue";
import PopularRoutes from "./Partials/PopularRoutes.vue";
import DiscoverRoutes from "./Partials/DiscoverRoutes.vue";
import ChallengesSection from "./Partials/ChallengesSection.vue";
import ReviewsSection from "./Partials/ReviewsSection.vue";
import { ref, onMounted, computed } from "vue";
import api from "../../services/api";

let trailsData = ref([]);
async function loadTrails() {
  try {
    const response = await api.trails.loadTrails();
    trailsData.value = response.data;
    console.log(trailsData.value);
  } catch (error) {
    // ElMessage.error("Błąd ładowania listy tras");
  }
}

onMounted(() => {
  loadTrails();
});
</script>
<template>
  <div v-if="trailsData">
    <SearchSlider :trailsData="trailsData" />
    <PopularRoutes :trailsData="trailsData" />
    <DiscoverRoutes />
    <ChallengesSection />
    <ReviewsSection :trailsData="trailsData" />
  </div>
</template>
