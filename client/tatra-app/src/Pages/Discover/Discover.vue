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
let childFriendly = ref(["Tak", "Nie"]);
let suitableForSeniors = ref(["Tak", "Nie"]);
let wheelchairAccessible = ref(["Tak", "Nie"]);

async function loadTrails() {
  try {
    const response = await api.trails.loadTrails();
    trailsData.value = response.data;
    filteredTrails.value = response.data;
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
        wheelchairAccessible.value.includes(trail.wheelchair_accessible))
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
      <div class="filters">
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
            Czas trasy
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
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
            Przewyższenie
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
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

        <el-dropdown trigger="click">
          <el-button type="primary">
            Poziom trudności
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
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
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
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

        <el-dropdown trigger="click">
          <el-button type="primary">
            Trasa dla dzieci
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <el-checkbox-group
                  v-model="childFriendly"
                  @click="handleCheckboxClick"
                >
                  <div class="checkbox-item">
                    <el-checkbox label="Tak">Tak</el-checkbox>
                  </div>
                  <div class="checkbox-item">
                    <el-checkbox label="Nie">Nie</el-checkbox>
                  </div>
                </el-checkbox-group>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dropdown trigger="click">
          <el-button type="primary">
            Trasa dla seniorów
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <el-checkbox-group
                  v-model="suitableForSeniors"
                  @click="handleCheckboxClick"
                >
                  <div class="checkbox-item">
                    <el-checkbox label="Tak">Tak</el-checkbox>
                  </div>
                  <div class="checkbox-item">
                    <el-checkbox label="Nie">Nie</el-checkbox>
                  </div>
                </el-checkbox-group>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dropdown trigger="click">
          <el-button type="primary">
            Trasa dla osób na wózku
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <el-checkbox-group
                  v-model="wheelchairAccessible"
                  @click="handleCheckboxClick"
                >
                  <div class="checkbox-item">
                    <el-checkbox label="Tak">Tak</el-checkbox>
                  </div>
                  <div class="checkbox-item">
                    <el-checkbox label="Nie">Nie</el-checkbox>
                  </div>
                </el-checkbox-group>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div v-if="filteredTrails.length > 0" class="discover-page__list">
        <div v-for="item in filteredTrails" :key="item.id" class="list-item">
          <RouterLink :to="`/route/${item.id}`" class="list-item-link">
            <div class="list-item-header">
              <img src="../../assets/img/route-img.png" alt="trasa" />
            </div>
            <div class="list-item-main">
              <el-tag :type="getDifficultyColor(item.difficulty_level)">
                {{ item.difficulty_level }}
              </el-tag>
              <span class="item-title">{{ item.trail_name }}</span>
              <span class="item-text">{{ item.mountain_range }}</span>
              <span class="item-text"
                >{{ item.route_length }} - {{ item.route_time }}</span
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
}
</style>
