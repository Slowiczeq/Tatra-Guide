<script setup>
import api from "../../services/api";
import { ref, onMounted, nextTick } from "vue";
import {
  ElMessage,
  ElCard,
  ElButton,
  ElTag,
  ElIcon,
  ElInput,
  ElDialog,
} from "element-plus";
import { Star, StarFilled, Loading } from "@element-plus/icons-vue";
import { useRoute } from "vue-router";
import { useGlobalStore } from "../../stores/globalStore";
import Reviews from "./Partials/Reviews.vue";
import Auth from "../../components/Login/Auth.vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-gpx";
import { useRouter } from "vue-router";

const router = useRouter();

const globalStore = useGlobalStore();

const route = useRoute();
const id = route.params.id;

let trailData = ref(null);
let userTrailInfo = ref(null);
let isTrailSaved = ref(false);
let rating = ref(0);
let review = ref("");
let showMapDialog = ref(false);
let showReviewDialog = ref(false);
let map = ref(null);
let gpxLayer = ref(null);
let isLoading = ref(true);

async function loadTrail() {
  try {
    const response = await api.trails.loadTrail(id);
    trailData.value = response.data;
    await checkUser();
    console.log(userTrailInfo.value);
  } catch (error) {
    ElMessage.error("Błąd ładowania trasy");
  } finally {
    isLoading.value = false;
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
    isTrailSaved.value = userTrailInfo.value.length > 0;
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

function resetReviewDialog() {
  rating.value = 0;
  review.value = "";
}

async function submitReview() {
  if (rating.value === 0 || review.value.trim() === "") {
    ElMessage.warning("Najpierw oceń trasę.");
    return;
  }

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
    showReviewDialog.value = false;
    resetReviewDialog();
    router.go(0);
  } catch (error) {
    ElMessage.error("Błąd podczas przesyłania opinii");
  }
}

function openMapDialog() {
  showMapDialog.value = true;
  nextTick(() => {
    if (!map.value) {
      map.value = L.map("map").setView([49.2771, 19.9817], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map.value);

      L.tileLayer("https://mapa-turystyczna.pl/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://mapa-turystyczna.pl">mapa-turystyczna.pl</a>',
      }).addTo(map.value);
    }
    if (gpxLayer.value) {
      map.value.removeLayer(gpxLayer.value);
    }

    gpxLayer.value = new L.GPX(`/gpx/${trailData.value[0].gpx}`, {
      async: true,
      marker_options: {
        startIconUrl:
          "https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-start.png",
        endIconUrl:
          "https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-end.png",
        shadowUrl:
          "https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-shadow.png",
      },
    }).on("loaded", (e) => {
      map.value.fitBounds(e.target.getBounds());
    });
    gpxLayer.value.addTo(map.value);
  });
}

function openReviewDialog() {
  resetReviewDialog();
  showReviewDialog.value = true;
}

function getImageUrl(imageName) {
  return new URL(`./img/${imageName}.webp`, import.meta.url).href;
}
</script>

<template>
  <div class="container">
    <Auth v-if="!globalStore.token" />
    <div v-else class="route-page">
      <div v-if="isLoading" class="loading-container">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
      </div>

      <el-card v-else class="route-page__item">
        <div class="list-item-header">
          <img
            :src="getImageUrl(trailData[0].image)"
            alt="trasa"
            class="route-img"
            style="width: 100%; height: 400px; border-radius: 15px"
          />
          <el-button class="map-button" @click="openMapDialog"
            >Pokaż mapę</el-button
          >
        </div>
        <div class="list-item-main">
          <h2 class="item-title">
            {{ trailData[0].trail_name }}
            <el-tag :type="getDifficultyColor(trailData[0].difficulty_level)">
              {{ trailData[0].difficulty_level }}
            </el-tag>
          </h2>
          <div class="item-details">
            <div class="item-details-text-container">
              <p>
                <strong>Położenie:</strong> {{ trailData[0].mountain_range }}
              </p>
              <p>
                <strong>Długość:</strong> {{ trailData[0].route_length }} km
              </p>
              <p><strong>Czas:</strong> {{ trailData[0].route_time }}</p>
            </div>
          </div>
          <div class="item-details-description">
            <p style="text-align: justify">
              <strong>Opis: </strong>{{ trailData[0].description }}
            </p>
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
            <el-button class="btn-primary" @click="openReviewDialog"
              >Napisz swoją opinię</el-button
            >
          </div>
        </div>
        <Reviews />
      </el-card>

      <el-dialog class="map-dialog" v-model="showMapDialog" width="80%" center>
        <template #title>
          <span>Mapa trasy</span>
        </template>
        <div id="map" style="height: 500px"></div>
      </el-dialog>

      <el-dialog
        class="review-dialog"
        v-model="showReviewDialog"
        width="50%"
        center
        @close="resetReviewDialog"
      >
        <div class="review-dialog-content">
          <p class="review-title">Oceń trasę:</p>
          <div class="stars">
            <el-icon
              v-for="i in 5"
              :key="i"
              @click="setRating(i)"
              :style="{
                cursor: 'pointer',
                fontSize: '30px',
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
            rows="6"
          />
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="showReviewDialog = false">Anuluj</el-button>
            <el-button type="primary" @click="submitReview"
              >Wyślij opinię</el-button
            >
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<style scoped>
.element-center {
  display: flex;
  justify-content: center;
  align-content: center;
}
.container {
  max-width: 1000px;
}
.route-page__item {
  margin-bottom: 20px;
  position: relative;
}
.list-item-header {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
}
.route-img {
  max-width: 100%;
  height: auto;
}
.map-button {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
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
  margin-bottom: 15px;
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

.item-details-description {
  max-width: 800px;
  padding: 20px;
}
.item-details-description p {
  text-align: justify;
  line-height: 22px;
}
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}
.item-details-text-container {
  display: flex;
  gap: 35px;
}

.review-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.review-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.stars {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.review-input {
  width: 100%;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 10px 20px;
}

.dialog-footer .el-button:first-child {
  margin-right: 10px;
}

.dialog-footer .el-button {
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 8px;
}

.dialog-footer .el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
  transition: background-color 0.3s, border-color 0.3s;
}

.dialog-footer .el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}
@media (max-width: 1040px) {
  .item-details-text-container {
    flex-direction: column;
    gap: 0;
  }
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
    max-width: 320px;
    width: 100%;
  }
  .item-details-description {
    padding: 0;
  }
}
</style>
