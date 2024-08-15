<script setup>
import { ref, onMounted, computed } from "vue";
import { ElIcon } from "element-plus";
import { Star, StarFilled } from "@element-plus/icons-vue";
import api from "../../../services/api";

const props = defineProps({
  trailsData: Object,
});

let reviewsData = ref([]);

async function getReviews() {
  try {
    const response = await api.reviews.getReviews();
    reviewsData.value = response.data;
  } catch (error) {
    console.error("Błąd ładowania listy tras");
  }
}

onMounted(() => {
  getReviews();
});

const topThreeReviews = computed(() => {
  return reviewsData.value
    .slice(-3)
    .reverse()
    .map((review) => {
      const trail = props.trailsData[review.routeID];
      return {
        ...review,
        trailName: trail ? trail.trail_name : "Nieznana trasa",
      };
    });
});

function renderStars(rating) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(i <= rating ? StarFilled : Star);
  }
  return stars;
}
function getImageUrl(imageName) {
  return new URL(`../../Discover/img/${imageName}.webp`, import.meta.url).href;
}
</script>

<template>
  <div v-if="reviewsData.length > 0" class="container-wrapper">
    <div class="container">
      <h3 class="routes-home-title">Najnowsze opinie</h3>
      <div class="review-section-container">
        <div
          v-for="review in topThreeReviews"
          :key="review.id"
          class="review-item"
        >
          <RouterLink class="review-title" :to="`/route/${review.routeID}`">{{
            review.trailName
          }}</RouterLink>
          <img
            style="border-radius: 15px"
            :src="getImageUrl(review.routeID)"
            alt="trasa"
          />
          <div class="reviews-box-container">
            <div class="review-box">
              <p style="margin-bottom: 10px; font-weight: 600">
                {{ review.userName }}
              </p>
              <div class="review-rating">
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
            </div>

            <p style="text-align: justify">{{ review.content }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-rating {
  display: flex;
  align-items: center;
  margin-left: -15px;
}

.stars {
  display: flex;
  margin-left: 10px;
}

.review-box {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column-reverse;
  align-items: flex-start;
  gap: 5px;
}
.review-section-container {
  display: flex;
  gap: 30px;
}
.review-item {
  flex-basis: calc(33.333% - 30px);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.review-item img {
  width: 100%;
}
.review-title {
  width: 100%;
  text-align: center;
  font-weight: 600;
  font-size: 20px;
  margin-bottom: 10px;
  color: #000;
  text-decoration: unset;
}
.reviews-box-container {
  display: flex;
  flex-direction: column;
  padding: 15px 20px;
}
.routes-home-title {
  font-weight: 400;
  font-size: 40px;
  border-bottom: 1px solid;
  display: flex;
  margin-bottom: 30px;
  padding-bottom: 30px;
}
@media (max-width: 1040px) {
  .routes-home-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  .review-section-container {
    flex-direction: column;
  }
  .review-box {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column-reverse;
    align-items: flex-start;
    gap: 3px;
  }
  .stars {
    margin-left: -3px;
  }
  .review-title {
    font-size: 16px;
  }
  .container-wrapper {
    padding: 15px 0;
  }
}
</style>
