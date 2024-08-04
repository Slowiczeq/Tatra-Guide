<script setup>
import api from "../../../services/api";
import { ref, onMounted, computed } from "vue";
import { ElMessage, ElIcon } from "element-plus";
import { Star, StarFilled } from "@element-plus/icons-vue";
import { useRoute } from "vue-router";

const route = useRoute();
const id = route.params.id;

let reviews = ref([]);

async function loadReviews() {
  const payload = {
    routeID: id,
  };

  try {
    const response = await api.reviews.getReviewsByRoute(payload);
    reviews.value = response.data;
  } catch (error) {
    ElMessage.error("Błąd ładowania recenzji");
  }
}

onMounted(() => {
  loadReviews();
});

function renderStars(rating) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(i <= rating ? StarFilled : Star);
  }
  return stars;
}

const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0;
  const sum = reviews.value.reduce(
    (acc, review) => acc + parseFloat(review.rating),
    0
  );
  return (sum / reviews.value.length).toFixed(1);
});
</script>

<template>
  <div class="reviews-container">
    <div class="average-rating">
      <el-icon style="font-size: 24px; color: #f7ba2a">
        <StarFilled />
      </el-icon>
      <span class="average-rating-value">{{ averageRating }}</span>
      <span class="review-count">({{ reviews.length }} opinii)</span>
    </div>

    <!-- Wyświetlanie recenzji -->
    <div v-if="reviews.length > 0">
      <div v-for="review in reviews" :key="review.id" class="review-item">
        <div class="review-rating">
          <strong>Ocena:</strong>
          <div class="stars">
            <el-icon
              v-for="(star, index) in renderStars(review.rating)"
              :key="index"
              style="font-size: 24px; color: #f7ba2a"
            >
              <component :is="star" />
            </el-icon>
          </div>
        </div>
        <p><strong>Autor:</strong> {{ review.userName }}</p>
        <p><strong>Treść:</strong> {{ review.content }}</p>
        <p>
          <strong>Data:</strong>
          {{ new Date(review.date).toLocaleDateString() }}
        </p>
      </div>
    </div>
    <div v-else>
      <p>Brak recenzji do wyświetlenia.</p>
    </div>
  </div>
</template>

<style scoped>
.reviews-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}

.average-rating {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.average-rating-value {
  font-size: 24px;
  font-weight: 700;
  margin-left: 5px;
}

.review-count {
  font-size: 16px;
  font-weight: 400;
  margin-left: 5px;
}

.review-item {
  border: 1px solid #e0e0e0;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.review-rating {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.stars {
  display: flex;
  margin-left: 10px;
}

p {
  margin: 5px 0;
}
</style>
