<script setup>
import { ref, computed, onMounted } from "vue";
import { Search } from "@element-plus/icons-vue";
import api from "../../../services/api";
import { useRouter } from "vue-router";

const router = useRouter();

let blogData = ref([]);
async function loadTrails() {
  try {
    const response = await api.blog.loadBlogs();
    blogData.value = response.data;
  } catch (error) {
    // ElMessage.error("Błąd ładowania blogów");
  }
}
function getImageUrl(imageName) {
  return new URL(`../../Blog/img/${imageName}`, import.meta.url).href;
}
onMounted(() => {
  loadTrails();
});
</script>

<template>
  <div v-if="blogData.length > 0" class="container">
    <span class="blog-title">Nasz blog</span>
    <div class="blog-container">
      <RouterLink
        v-for="(item, index) in Object.values(blogData).slice(0, 3)"
        :to="`/blog/${item.id}`"
        :key="item.id"
        class="blog-item"
        :class="{ 'first-blog-item': index === 0 }"
      >
        <div class="blog-top">
          <img :src="getImageUrl(item.img)" alt="" class="blog-img" />
        </div>
        <div class="blog-bottom">
          <p class="blog-author">Autor: {{ item.author }}</p>

          <div class="blog-box">
            <p class="blog-name">{{ item.name }}</p>
            <p class="blog-short-description">{{ item.short_description }}</p>
          </div>

          <p class="blog-date">{{ item.date }}</p>
        </div>
      </RouterLink>
    </div>
    <div class="blog-footer-button">
      <el-button class="btn-primary" @click="router.push('/blog')"
        >Odwiedź bloga</el-button
      >
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (min-width: 992px) {
  .blog-background {
    height: 400px;
    overflow: hidden;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
}

.blog-title {
  font-size: 40px;
  border-bottom: 1px solid;
  display: flex;
  margin-bottom: 30px;
  padding-bottom: 30px;
}
.blog-container {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
}

.blog-item {
  border-radius: 24px;
  border: 2px solid #e6e6e6;
  background: #fafaf5;
  width: calc(33% - 20px);
  display: flex;
  flex-direction: column;
}

@media (max-width: 1500px) {
  .blog-item {
    border-radius: 24px;
    border: 2px solid #e6e6e6;
    background: #fafaf5;
    width: calc(33% - 25px);
    display: flex;
    flex-direction: column;
  }
}

.blog-top {
  width: 100%;
  height: 250px;
  overflow: hidden;
  display: flex;
  align-content: center;
  justify-content: center;
}
.blog-top img {
  width: 100%;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
}
a {
  text-decoration: unset;
  color: #6d6d6d;
}
.blog-bottom {
  padding: 20px;
}
.blog-box {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 20px;
  padding-bottom: 20px;
  margin-bottom: 20px;
  margin-top: 20px;
  border-top: 1px solid #e6e6e6;
  border-bottom: 1px solid #e6e6e6;
}
.blog-name {
  font-size: 20px;
  font-weight: 600;
  color: #000;
}
.blog-short-description {
  font-size: 16px;
  line-height: 24px;
  height: 100px;
}

@media (max-width: 1040px) {
  .blog-item {
    width: 100%;
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.blog-footer-button {
  display: flex;
  justify-content: center;
}
</style>
