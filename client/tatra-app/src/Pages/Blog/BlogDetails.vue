<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "../../services/api";
import { ElMessage } from "element-plus";

const route = useRoute();
const blogId = route.params.id;

let blogDetails = ref(null);

async function loadBlogDetails() {
  try {
    const response = await api.blog.loadBlog(blogId);
    blogDetails.value = response.data;
    console.log(response.data);
  } catch (error) {
    ElMessage.error("Błąd ładowania szczegółów bloga");
  }
}

function getImageUrl(imageName) {
  return new URL(`./img/${imageName}`, import.meta.url).href;
}

onMounted(() => {
  loadBlogDetails();
});
</script>

<template>
  <div v-if="blogDetails" class="blog-details-container">
    <div class="blog-details-top">
      <img
        :src="getImageUrl(blogDetails[0].img)"
        alt="Blog image"
        class="blog-details-img"
      />
    </div>
    <div class="blog-details-bottom">
      <h1 class="blog-title">{{ blogDetails[0].name }}</h1>
      <p class="blog-author">Autor: {{ blogDetails[0].author }}</p>
      <p class="blog-date">{{ blogDetails[0].date }}</p>
      <div class="blog-description">{{ blogDetails[0].description }}</div>
    </div>
  </div>
</template>

<style scoped>
.blog-details-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.blog-details-top {
  width: 100%;
  height: 500px;
  overflow: hidden;
  display: flex;
  align-content: center;
  justify-content: center;
  margin-bottom: 30px;
}

.blog-details-img {
  border-radius: 24px;
}

.blog-details-bottom {
  padding: 20px;
  background: #fafaf5;
  border-radius: 24px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.blog-title {
  font-size: 36px;
  font-weight: 600;
  color: #000;
  margin-bottom: 20px;
}

.blog-author {
  font-size: 18px;
  color: #6d6d6d;
  margin-bottom: 10px;
}

.blog-date {
  font-size: 16px;
  color: #9d9d9d;
  margin-bottom: 30px;
}

.blog-description {
  font-size: 18px;
  line-height: 1.6;
  color: #333;
}

@media (max-width: 768px) {
  .blog-details-top {
    height: 300px;
  }
  .blog-title {
    font-size: 24px;
  }
}
</style>
