<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Search } from "@element-plus/icons-vue";

const props = defineProps({
  trailsData: Object,
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
function getImageUrl(imageName) {
  return new URL(`../../Discover/img/${imageName}.webp`, import.meta.url).href;
}
</script>

<template>
  <div class="container">
    <RouterLink class="routes-home-title" :to="`/discover`">
      <h3 class="routes-home-title">Popularne trasy</h3>
    </RouterLink>
    <div class="routers-home-container">
      <div
        v-for="item in Object.values(trailsData).slice(0, 3)"
        :key="item.id"
        class="list-item"
      >
        <RouterLink :to="`/route/${item.id}`" class="list-item-link">
          <div class="list-item-header">
            <img
              style="border-radius: 15px"
              :src="getImageUrl(item.image)"
              alt="trasa"
            />
          </div>
          <div class="list-item-main">
            <span class="item-title">{{ item.trail_name }}</span>
            <span class="item-text">{{ item.mountain_range }}</span>
            <span class="item-text">
              {{ item.route_length }}km - {{ item.route_time }} -
              <el-tag :type="getDifficultyColor(item.difficulty_level)">
                {{ item.difficulty_level }}
              </el-tag>
            </span>
          </div>
          <div class="list-item-footer"></div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.routers-home-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}
.routes-home-title {
  font-size: 40px;
  font-weight: 400;
  color: #000;
  text-decoration: unset;
}

.list-item {
  background: white;
  overflow: hidden;
  width: calc(33.333% - 16px);
}

.list-item:hover {
}

.list-item-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.list-item-header img {
  width: 100%;
  height: auto;
}

.list-item-main {
  padding: 5px 20px;
}

.item-title {
  display: block;
  font-size: 1.25rem;
  font-weight: bold;
  margin: 8px 0;
}

.item-text {
  display: block;
  font-size: 1rem;
  color: #000;
}

@media (max-width: 1040px) {
  .routes-home-title {
    font-size: 24px;
    font-weight: 600;
  }
  .routers-home-container {
    flex-direction: column;
  }
  .list-item {
    width: 100%;
  }
  .item-title {
    font-size: 16px;
  }
}
</style>
