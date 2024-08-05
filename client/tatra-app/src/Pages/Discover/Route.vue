<script setup>
import api from "../../services/api";
import { ref, onMounted } from "vue";
import {
  ElMessage,
  ElCard,
  ElButton,
  ElTag,
  ElIcon,
  ElInput,
} from "element-plus";
import { Star, StarFilled } from "@element-plus/icons-vue";
import { useRoute } from "vue-router";
import { useGlobalStore } from "../../stores/globalStore";
import Reviews from "./Partials/Reviews.vue";
import Auth from "../../components/Login/Auth.vue";

const globalStore = useGlobalStore();

const route = useRoute();
const id = route.params.id;

let trailData = ref(null);
let userTrailInfo = ref(null);
let isTrailSaved = ref(false); // Zmienna kontrolująca stan zapisu trasy
let rating = ref(0);
let review = ref("");

async function loadTrail() {
  try {
    const response = await api.trails.loadTrail(id);
    trailData.value = response.data;
    await checkUser();
    console.log(userTrailInfo.value);
  } catch (error) {
    ElMessage.error("Błąd ładowania trasy");
  }
}

async function checkUser() {
  const payload = {
    userID: globalStore.userID,
    routeID: trailData.value[0].id,
  };
  try {
    const response = await api.trails.checkUser(payload);
    userTrailInfo.value = response.data;
    isTrailSaved.value = userTrailInfo.value.length > 0; // Ustawienie stanu na podstawie obecności trasy w danych użytkownika
  } catch (error) {
    ElMessage.error("Błąd ładowania danych użytkownika");
  }
}

onMounted(() => {
  loadTrail();
});

function getDifficultyColor(level) {
  switch (level) {
    case "Łatwy":
      return "success";
    case "Średni":
      return "primary";
    case "Trudny":
      return "warning";
    case "Bardzo Trudny":
      return "danger";
    default:
      return "";
  }
}

async function saveTrail(id, dist) {
  const payload = {
    userID: globalStore.userID,
    routeID: id,
  };
  try {
    const response = await api.trails.saveTrail(payload);
    userTrailInfo.value = response.data;
    isTrailSaved.value = true;
    ElMessage.success("Trasa zapisana!");
  } catch (error) {
    ElMessage.error("Błąd podczas zapisywania trasy");
  }
}

async function deleteTrail(id) {
  const payload = {
    userID: globalStore.userID,
    routeID: id,
  };
  try {
    const response = await api.trails.deleteTrail(payload);
    userTrailInfo.value = response.data;
    isTrailSaved.value = false;
    ElMessage.success("Trasa usunięta!");
  } catch (error) {
    ElMessage.error("Błąd podczas usuwania trasy");
  }
}

function setRating(value) {
  rating.value = value;
}

async function submitReview() {
  const payload = {
    userID: globalStore.userID,
    userName: `${globalStore.userFirstName} ${globalStore.userLastName}`,
    routeID: trailData.value[0].id,
    rating: rating.value,
    content: review.value,
    date: new Date().toISOString(),
  };
  try {
    const response = await api.reviews.submitReview(payload);
    ElMessage.success("Dziękujemy za opinię!");
  } catch (error) {
    ElMessage.error("Błąd podczas przesyłania opinii");
  }
}
</script>

<template>
  <Auth v-if="!globalStore.token" />
  <div v-else class="container route-page">
    <el-card v-if="trailData" class="route-page__item">
      <div class="list-item-header">
        <img
          src="../../assets/img/route.jpg"
          alt="trasa"
          class="route-img"
          style="width: 100%; height: 400px; border-radius: 15px"
        />
      </div>
      <div class="list-item-main">
        <h2 class="item-title">
          {{ trailData[0].trail_name }}
          <el-tag :type="getDifficultyColor(trailData[0].difficulty_level)">
            {{ trailData[0].difficulty_level }}
          </el-tag>
        </h2>
        <div class="item-details">
          <div>
            <p><strong>Położenie:</strong> {{ trailData[0].mountain_range }}</p>
            <p><strong>Długość:</strong> {{ trailData[0].route_length }} km</p>
            <p><strong>Czas:</strong> {{ trailData[0].route_time }}</p>
          </div>
          <div>
            <p>
              <strong>Trasa dla dzieci:</strong>
              {{ trailData[0].child_friendly }}
            </p>
            <p>
              <strong>Trasa dla seniorów:</strong>
              {{ trailData[0].suitable_for_seniors }}
            </p>
            <p>
              <strong>Trasa dla osób na wózku:</strong>
              {{ trailData[0].wheelchair_accessible }}
            </p>
          </div>
        </div>
        <div class="action-buttons">
          <el-button
            v-if="!isTrailSaved"
            class="btn-primary"
            @click="saveTrail(trailData[0].id)"
            >Zapisz trasę</el-button
          >
          <el-button
            v-if="isTrailSaved"
            class="btn-primary"
            @click="deleteTrail(trailData[0].id)"
            >Usuń</el-button
          >
        </div>
        <div class="review-section">
          <p>Oceń trasę:</p>
          <div class="stars">
            <el-icon
              v-for="i in 5"
              :key="i"
              @click="setRating(i)"
              :style="{
                cursor: 'pointer',
                fontSize: '24px',
                color: i <= rating ? '#F7BA2A' : '#C8C8C8',
              }"
            >
              <component :is="i <= rating ? StarFilled : Star" />
            </el-icon>
          </div>
          <el-input
            type="textarea"
            v-model="review"
            placeholder="Podziel się swoją opinią o trasie"
            class="review-input"
          />
          <el-button class="btn-primary" @click="submitReview"
            >Wyślij opinię</el-button
          >
        </div>
      </div>
      <Reviews />
    </el-card>
    <div class="element-center" v-else>Ładowanie danych...</div>
  </div>
</template>

<style scoped>
.element-center {
  display: flex;
  justify-content: center;
  align-content: center;
}
.container {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
}
.route-page__item {
  margin-bottom: 20px;
  position: relative;
}
.list-item-header {
  text-align: center;
  margin-bottom: 20px;
}
.route-img {
  max-width: 100%;
  height: auto;
}
.item-title {
  font-size: 24px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.item-details {
  margin-bottom: 35px;
  display: flex;
  gap: 40px;
  margin-top: 25px;
}
.item-details p {
  margin: 5px 0;
}
.action-buttons {
  text-align: center;
  text-align: center;
  position: absolute;
  top: 25px;
  right: 25px;
}
.btn-primary {
  margin: 5px;
}
.review-section {
  text-align: center;
  margin-top: 20px;
}
.stars {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.review-input {
  width: 100%;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .container {
    margin-top: 30px;
    margin-bottom: 30px;
  }
  .action-buttons {
    top: 5px;
    right: 5px;
  }
  .route-img {
    height: 310px !important;
  }
  .item-details {
    gap: 0;
  }
}
</style>
