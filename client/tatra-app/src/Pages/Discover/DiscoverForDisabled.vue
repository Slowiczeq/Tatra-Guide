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

async function loadTrails() {
  try {
    const response = await api.trails.loadTrails();
    trailsData.value = response.data.filter(
      (item) => item.wheelchair_accessible == "Tak"
    );
  } catch (error) {
    ElMessage.error("Błąd ładowania listy tras");
  }
}

onMounted(() => {
  loadTrails();
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

function handleCheckboxClick(event) {
  event.stopPropagation();
}
</script>

<template>
  <div class="container">
    <Auth v-if="!globalStore.token" />
    <div v-else class="discover-page">
      <span class="filters-title">Trasy dla wózków inwalidzkich</span>
      <div v-if="trailsData.length > 0" class="discover-page__list">
        <div v-for="item in trailsData" :key="item.id" class="list-item">
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
.container {
  margin: 30px 0;
  margin-bottom: 60px;
}
.filters-title {
  font-size: 20px;
  font-weight: 600;
  display: flex;
  margin-bottom: 15px;
}
</style>
