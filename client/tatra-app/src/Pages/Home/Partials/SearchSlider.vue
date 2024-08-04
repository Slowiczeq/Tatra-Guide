<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Search } from "@element-plus/icons-vue";

const props = defineProps({
  trailsData: Object,
});

const searchQuery = ref("");
const options = ref([]);
const loading = ref(false);

const router = useRouter();

const remoteMethod = (query) => {
  if (query) {
    loading.value = true;
    options.value = Object.values(props.trailsData).filter((trail) => {
      return trail.trail_name.toLowerCase().includes(query.toLowerCase());
    });
    loading.value = false;
  } else {
    options.value = [];
  }
};

const handleSelect = (id) => {
  router.push(`/route/${id}`);
};
</script>

<template>
  <div class="search-container">
    <h1 class="title">Zaplanuj swoją wyprawę</h1>
    <div class="search-wrapper">
      <el-icon class="search-icon" color="#828282">
        <Search />
      </el-icon>
      <el-select
        v-model="searchQuery"
        filterable
        remote
        reserve-keyword
        placeholder="Szukaj trasy..."
        :remote-method="remoteMethod"
        :loading="loading"
        style="width: 100%"
        @change="handleSelect"
        class="search-input"
      >
        <el-option
          v-for="item in options"
          :key="item.id"
          :label="item.trail_name"
          :value="item.id"
        />
      </el-select>
    </div>
  </div>
</template>

<style scoped>
.search-container {
  height: 650px;
  background-image: url("../../../assets/img/background.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.title {
  color: white;
  font-size: 64px;
  font-weight: 700;
  margin-bottom: 20px;
}

.search-wrapper {
  position: relative;
  width: 400px;
  margin-top: 20px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #ccc;
  z-index: 3;
}

.search-input {
}
</style>
