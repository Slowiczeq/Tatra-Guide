<script setup>
import api from "../../services/api";
import { ref, onMounted, watch } from "vue";
import Auth from "../../components/Login/Auth.vue";
import { useGlobalStore } from "../../stores/globalStore";
import {
  ElMessage,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElCheckboxGroup,
  ElCheckbox,
  ElButton,
  ElIcon,
  ElSlider,
} from "element-plus";
import { ArrowDown } from "@element-plus/icons-vue";

const globalStore = useGlobalStore();

let trailsData = ref([]);
let filteredTrails = ref([]);
let selectedMountainRanges = ref(["Tatry Wysokie", "Tatry Zachodnie"]);
let maxRouteTime = ref(20);
let maxRouteLength = ref(40);
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
let childFriendly = ref([]);
let suitableForSeniors = ref([]);
let wheelchairAccessible = ref([]);

async function loadTrails() {
  try {
    const response = await api.trails.loadTrails();
    trailsData.value = response.data.filter(
      (item) => item.child_friendly == "Tak"
    );
    filteredTrails.value = response.data.filter(
      (item) => item.child_friendly == "Tak"
    );
  } catch (error) {
    ElMessage.error("Błąd ładowania listy tras");
  }
}

onMounted(() => {
  loadTrails();
});

watch(
  [
    selectedMountainRanges,
    maxRouteTime,
    maxRouteLength,
    maxElevationGain,
    selectedDifficultyLevels,
    selectedSkillLevels,
    childFriendly,
    suitableForSeniors,
    wheelchairAccessible,
  ],
  () => {
    applyFilters();
  }
);

function applyFilters() {
  filteredTrails.value = trailsData.value.filter((trail) => {
    const trailTime = parseFloat(trail.route_time);
    const trailLength = parseFloat(trail.route_length);
    const elevationGain = parseInt(trail.elevation_gain);

    return (
      (selectedMountainRanges.value.length === 0 ||
        selectedMountainRanges.value.includes(trail.mountain_range.trim())) &&
      trailTime <= maxRouteTime.value &&
      elevationGain <= maxElevationGain.value &&
      (selectedDifficultyLevels.value.length === 0 ||
        selectedDifficultyLevels.value.includes(trail.difficulty_level)) &&
      (selectedSkillLevels.value.length === 0 ||
        selectedSkillLevels.value.includes(trail.skill_level)) &&
      (childFriendly.value.length === 0 ||
        childFriendly.value.includes(trail.child_friendly)) &&
      (suitableForSeniors.value.length === 0 ||
        suitableForSeniors.value.includes(trail.suitable_for_seniors)) &&
      (wheelchairAccessible.value.length === 0 ||
        wheelchairAccessible.value.includes(trail.wheelchair_accessible)) &&
      trailLength <= maxRouteLength.value
    );
  });
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

function handleCheckboxClick(event) {
  event.stopPropagation();
}
</script>

<template>
  <div class="container">
    <Auth v-if="!globalStore.token" />
    <div v-else class="discover-page">
      <span class="filters-title">Dostosuj filtry</span>
      <div class="filters">
        <el-dropdown trigger="click">
          <el-button type="primary">
            Pasmo górskie
            <!-- <el-icon class="el-icon--right"><arrow-down /></el-icon> -->
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
            Czas trasy
            <!-- <el-icon class="el-icon--right"><arrow-down /></el-icon> -->
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <div>
                  <div>Czas trasy: {{ maxRouteTime }} godz.</div>
                  <el-slider
                    v-model="maxRouteTime"
                    :min="0"
                    :max="20"
                    :step="0.1"
                    show-tooltip
                    tooltip-class="slider-tooltip"
                    style="width: 200px"
                  ></el-slider>
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dropdown trigger="click">
          <el-button type="primary">
            Długość trasy
            <!-- <el-icon class="el-icon--right"><arrow-down /></el-icon> -->
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <div>
                  <div>Długość trasy: {{ maxRouteLength }} km</div>
                  <el-slider
                    v-model="maxRouteLength"
                    :min="0"
                    :max="40"
                    :step="0.1"
                    show-tooltip
                    tooltip-class="slider-tooltip"
                    style="width: 200px"
                  ></el-slider>
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dropdown trigger="click">
          <el-button type="primary">
            Przewyższenie
            <!-- <el-icon class="el-icon--right"><arrow-down /></el-icon> -->
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <div>
                  <div>Przewyższenie: {{ maxElevationGain }} m</div>
                  <el-slider
                    v-model="maxElevationGain"
                    :min="0"
                    :max="2000"
                    :step="50"
                    show-tooltip
                    tooltip-class="slider-tooltip"
                    style="width: 200px"
                  ></el-slider>
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <span style="margin-top: 20px; margin-bottom: 5px" class="filters-title"
        >Trasy dla rodzin z dziećmi</span
      >
      <div v-if="filteredTrails.length > 0" class="discover-page__list">
        <div v-for="item in filteredTrails" :key="item.id" class="list-item">
          <RouterLink :to="`/route/${item.id}`" class="list-item-link">
            <div class="list-item-header">
              <img src="../../assets/img/route-img.png" alt="trasa" />
            </div>
            <div class="list-item-main">
              <span class="item-title">{{ item.trail_name }}</span>
              <span class="item-text">{{ item.mountain_range }}</span>
              <span class="item-text"
                >{{ item.route_length }}km - {{ item.route_time }} -
                <el-tag :type="getDifficultyColor(item.difficulty_level)">
                  {{ item.difficulty_level }}
                </el-tag></span
              >
            </div>
            <div class="list-item-footer"></div>
          </RouterLink>
        </div>
      </div>
      <div v-else class="no-trails">Brak tras</div>
    </div>
  </div>
</template>

<style scoped>
.discover-page {
  margin: 0 auto;
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
}
.filters .el-dropdown button {
  background: transparent;
  color: #828282;
  border: 1px solid #828282;
  border-radius: 25px;
  padding: 20px 15px;
}
</style>
