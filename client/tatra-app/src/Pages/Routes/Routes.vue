<script setup>
import { onMounted, ref, watch } from "vue";
import { useGlobalStore } from "../../stores/globalStore";
import Auth from "../../components/Login/Auth.vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-gpx";
import {
  ElMessage,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElCheckboxGroup,
  ElCheckbox,
  ElButton,
  ElSlider,
  ElIcon,
  ElSelect,
  ElOption,
} from "element-plus";
import { ArrowDown } from "@element-plus/icons-vue";
import { peaks } from "./Partials/peaks";
import api from "../../services/api";

const globalStore = useGlobalStore();

const initialPosition = ref([49.2771, 19.9817]);
let selectedMountainRanges = ref(["Tatry Wysokie", "Tatry Zachodnie"]);
let maxRouteLength = ref(30);
let maxRouteTime = ref(20);
let maxElevationGain = ref(2000);
let selectedDifficultyLevels = ref([
  "Łatwy",
  "Średni",
  "Trudny",
  "Bardzo Trudny",
]);
let selectedSkillLevels = ref([
  "Początkujący",
  "Średniozaawansowany",
  "Zaawansowany",
]);
let currentRouteIndex = 0;

let map;
let markers = [];
let gpxLayer;
let selectedTrailId = ref(null);

const showRoute = (gpxFile) => {
  if (gpxLayer) {
    map.removeLayer(gpxLayer);
  }
  if (gpxFile) {
    gpxLayer = new L.GPX(gpxFile, {
      async: true,
      marker_options: {
        startIconUrl:
          "https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-start.png",
        endIconUrl:
          "https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-end.png",
        shadowUrl:
          "https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-shadow.png",
      },
    })
      .on("loaded", (e) => {
        map.fitBounds(e.target.getBounds());
      })
      .addTo(map);
  }
};

let trailsData = ref([]);
let filteredTrails = ref([]);
async function loadTrails() {
  try {
    const response = await api.trails.loadTrails();
    trailsData.value = response.data;
    filteredTrails.value = response.data;
  } catch (error) {
    ElMessage.error("Błąd ładowania listy tras");
  }
}
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

const updatePopup = (marker, peak) => {
  if (!peak.routes || peak.routes.length === 0) return;

  const route = peak.routes[currentRouteIndex];
  const popupContent = document.createElement("div");

  const titleLink = route.id
    ? `<a href="/route/${route.id}" target="_blank" class="route-link">${route.name}</a>`
    : `<strong>${route.name}</strong>`;

  popupContent.innerHTML = `
    <div>
      ${titleLink}
      <br>
      ${route.length ? `Długość trasy: ${route.length}` : ""}
      <br>
      ${route.time ? `Czas trasy: ${route.time}` : ""}
      <br>
      ${route.difficulty ? `Trudność: ${route.difficulty}` : ""}
      <br>
    </div>
  `;
  if (peak.routes.length > 1) {
    const counter = document.createElement("span");
    counter.innerText = ` (${currentRouteIndex + 1}/${peak.routes.length})`;

    const button = document.createElement("button");
    button.innerText = "Dalej";
    button.className = "el-button el-button--primary";
    button.onclick = () => {
      currentRouteIndex = (currentRouteIndex + 1) % peak.routes.length;
      marker.closePopup();
      setTimeout(() => {
        updatePopup(marker, peak);
        marker.openPopup();
      }, 200);
    };
    popupContent.appendChild(button);
    popupContent.appendChild(counter);
  }
  marker.bindPopup(popupContent).openPopup();
  showRoute(route.gpx);

  selectedTrailId.value = ""; // Czyszczenie wartości w el-select po kliknięciu na mapie
};

const createCustomIcon = (peak) => {
  const iconHtml = `
    <div style="position: relative;">
      <img src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png" style="width: 25px; height: 41px;">
      ${
        peak.routes && peak.routes.length > 1
          ? `<div style="position: absolute; top: -5px; right: -10px; background: red; color: white; border-radius: 50%; padding: 2px 5px;">${peak.routes.length}</div>`
          : ""
      }
    </div>
  `;
  return L.divIcon({
    html: iconHtml,
    className: "custom-icon",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
};

const updateMapMarkers = () => {
  markers.forEach((marker) => map.removeLayer(marker));
  markers = [];

  peaks.forEach((peak) => {
    const routesInRange = peak.routes.filter((route) => {
      const routeLength = parseFloat(route.length);
      const routeTime = parseFloat(route.time);
      const routeElevation = parseFloat(route.elevation_gain);

      return (
        selectedMountainRanges.value.includes(route.mountain_range.trim()) &&
        routeLength <= maxRouteLength.value &&
        routeTime <= maxRouteTime.value &&
        routeElevation <= maxElevationGain.value &&
        selectedDifficultyLevels.value.includes(route.difficulty.trim()) &&
        selectedSkillLevels.value.includes(route.skill_level.trim())
      );
    });

    if (routesInRange.length > 0) {
      const icon = createCustomIcon(peak);
      const marker = L.marker([peak.lat, peak.lng], { icon }).addTo(map);
      peak.marker = marker;
      markers.push(marker);
      marker
        .bindPopup("", { keepInView: true })
        .on("click", () => {
          currentRouteIndex = 0;
          updatePopup(marker, peak);
          marker.openPopup();
        })
        .on("popupclose", () => {
          if (gpxLayer) {
            map.removeLayer(gpxLayer);
            gpxLayer = null;
          }
        });
    }
  });
};

const findAndOpenMarker = (trailId) => {
  for (let peak of peaks) {
    const routeIndex = peak.routes.findIndex((route) => route.id === trailId);
    if (routeIndex !== -1) {
      currentRouteIndex = routeIndex;
      const marker = peak.marker;
      if (marker) {
        updatePopup(marker, peak);
        marker.openPopup();
        selectedTrailId.value = trailId; // Ustawianie wartości w el-select
        return;
      }
    }
  }
};

onMounted(() => {
  if (globalStore.token) {
    map = L.map("map").setView(initialPosition.value, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Dane: <a href="https://mapa-turystyczna.pl">mapa-turystyczna.pl</a>',
    }).addTo(map);

    updateMapMarkers();
    loadTrails();
  }
});

watch(
  [
    selectedMountainRanges,
    maxRouteLength,
    maxRouteTime,
    maxElevationGain,
    selectedDifficultyLevels,
    selectedSkillLevels,
  ],
  () => {
    updateMapMarkers();
  }
);

function handleCheckboxClick(event) {
  event.stopPropagation();
}

function handleListItemClick(trailId) {
  findAndOpenMarker(trailId);
}

function filterTrails(query) {
  if (query !== "") {
    filteredTrails.value = trailsData.value.filter((item) =>
      item.trail_name.toLowerCase().includes(query.toLowerCase())
    );
  } else {
    filteredTrails.value = [];
  }
}
</script>

<template>
  <div>
    <div class="container" v-if="!globalStore.token">
      <Auth style="margin-top: 95px" />
    </div>
    <div class="map-page-container" v-else>
      <span style="padding: 0px 30px" class="filters-title"
        >Dostosuj filtry</span
      >
      <div style="padding: 5px 30px" class="filters">
        <el-dropdown trigger="click">
          <el-button type="primary">
            Pasmo górskie
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <el-checkbox-group
                  v-model="selectedMountainRanges"
                  @click="handleCheckboxClick"
                >
                  <div class="checkbox-item">
                    <el-checkbox label="Tatry Wysokie"
                      >Tatry Wysokie</el-checkbox
                    >
                  </div>
                  <div class="checkbox-item">
                    <el-checkbox label="Tatry Zachodnie"
                      >Tatry Zachodnie</el-checkbox
                    >
                  </div>
                </el-checkbox-group>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dropdown trigger="click">
          <el-button type="primary">
            Długość trasy
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <div class="slider-container">
                  <div>Długość: {{ maxRouteLength }} km</div>
                  <el-slider
                    v-model="maxRouteLength"
                    @click="handleCheckboxClick"
                    :min="0"
                    :max="30"
                    :step="1"
                    style="width: 200px"
                    show-tooltip
                  >
                  </el-slider>
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown trigger="click">
          <el-button type="primary">
            Czas trasy
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <div class="slider-container">
                  <div>Czas: {{ maxRouteTime }} h</div>
                  <el-slider
                    v-model="maxRouteTime"
                    @click="handleCheckboxClick"
                    :min="0"
                    :max="20"
                    :step="1"
                    style="width: 200px"
                    show-tooltip
                  >
                  </el-slider>
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown trigger="click">
          <el-button type="primary">
            Przewyższenie
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <div class="slider-container">
                  <div>Przewyższenie: {{ maxElevationGain }} h</div>
                  <el-slider
                    v-model="maxElevationGain"
                    @click="handleCheckboxClick"
                    :min="0"
                    :max="2000"
                    :step="1"
                    style="width: 200px"
                    show-tooltip
                  >
                  </el-slider>
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown trigger="click">
          <el-button type="primary"> Poziom trudności </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <el-checkbox-group
                  v-model="selectedDifficultyLevels"
                  @click="handleCheckboxClick"
                >
                  <div class="checkbox-item">
                    <el-checkbox label="Łatwy">Łatwy</el-checkbox>
                  </div>
                  <div class="checkbox-item">
                    <el-checkbox label="Średni">Średni</el-checkbox>
                  </div>
                  <div class="checkbox-item">
                    <el-checkbox label="Trudny">Trudny</el-checkbox>
                  </div>
                  <div class="checkbox-item">
                    <el-checkbox label="Bardzo Trudny"
                      >Bardzo Trudny</el-checkbox
                    >
                  </div>
                </el-checkbox-group>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown trigger="click">
          <el-button type="primary">
            Poziom zaawansowania
            <!-- <el-icon class="el-icon--right"><arrow-down /></el-icon> -->
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <el-checkbox-group
                  v-model="selectedSkillLevels"
                  @click="handleCheckboxClick"
                >
                  <div class="checkbox-item">
                    <el-checkbox label="Początkujący">Początkujący</el-checkbox>
                  </div>
                  <div class="checkbox-item">
                    <el-checkbox label="Średniozaawansowany"
                      >Średniozaawansowany</el-checkbox
                    >
                  </div>
                  <div class="checkbox-item">
                    <el-checkbox label="Zaawansowany">Zaawansowany</el-checkbox>
                  </div>
                </el-checkbox-group>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="map-container">
        <div class="map-aside">
          <el-select
            v-model="selectedTrailId"
            filterable
            placeholder="Wyszukaj trasę"
            style="width: 100%; margin-bottom: 20px"
            :filter-method="filterTrails"
            @change="handleListItemClick"
          >
            <el-option
              v-for="item in filteredTrails"
              :key="item.id"
              :label="item.trail_name"
              :value="item.id"
            />
          </el-select>
          <div class="map-aside__list">
            <span class="list-title">Nasze rekomendacje</span>
            <div
              v-for="item in Object.values(trailsData).slice(0, 3)"
              :key="item.id"
              class="list-item"
              @click="handleListItemClick(item.id)"
            >
              <div class="list-item-link">
                <div class="list-item-header">
                  <!-- <img src="../../assets/img/route-img.png" alt="trasa" /> -->
                </div>
                <div class="list-item-main">
                  <el-tag :type="getDifficultyColor(item.difficulty_level)">
                    {{ item.difficulty_level }}
                  </el-tag>
                  <span class="item-title">{{ item.trail_name }}</span>
                  <span class="item-text">{{ item.mountain_range }}</span>
                  <span class="item-text">
                    {{ item.route_length }} - {{ item.route_time }}
                  </span>
                </div>
                <div class="list-item-footer"></div>
              </div>
            </div>
          </div>
        </div>
        <div id="map"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}
.filters-title {
  font-size: 20px;
  font-weight: 600;
  display: flex;
  margin-bottom: 15px;
  margin-top: 20px;
}
.filters .el-dropdown button {
  background: transparent;
  color: #828282;
  border: 1px solid #828282;
  border-radius: 25px;
  padding: 20px 15px;
}

.checkbox-item {
  margin-bottom: 5px;
}

.slider-container {
  width: 200px;
  padding: 10px;
}

#map {
  width: 100%;
  height: 800px;
  position: relative;
}

.route-link {
  text-decoration: none;
  color: inherit;
}

.map-aside {
  width: 300px;
  float: left;
  padding: 10px;
  background: #fff;
  border-right: 1px solid #ddd;
  height: 100%;
  overflow-y: auto;
}

.map-aside__list {
  margin-top: 20px;
}

.list-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.list-item {
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
}

.list-item-link {
  display: flex;
  align-items: center;
}

.list-item-header img {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}

.list-item-main {
  flex: 1;
}

.item-title {
  font-size: 16px;
  font-weight: bold;
}

.item-text {
  font-size: 14px;
  color: #666;
}

.item-text:not(:last-child) {
  margin-right: 10px;
}

@media (max-width: 768px) {
  .map-container {
    flex-direction: column;
  }
  .map-page-container {
    max-width: 320px;
    margin: 30px auto;
  }
  .map-aside {
    border-right: unset;
  }
  #map {
    height: 500px;
  }
  .filters {
    padding: 0 5px !important;
  }
  .filters-title {
    padding: 0 5px !important;
  }
}
</style>
