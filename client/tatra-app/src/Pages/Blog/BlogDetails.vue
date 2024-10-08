<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "../../services/api";
import { ElMessage, ElDialog, ElInput, ElButton, ElIcon } from "element-plus";
import { Loading } from "@element-plus/icons-vue";
import { useGlobalStore } from "../../stores/globalStore";

const route = useRoute();
const blogId = route.params.id;
const globalStore = useGlobalStore();

let blogDetails = ref(null);
let isLoading = ref(true);
let showCommentDialog = ref(false);
let comment = ref("");
let comments = ref([]);

async function loadBlogDetails() {
  try {
    const response = await api.blog.loadBlog(blogId);
    blogDetails.value = response.data;
    loadComments();
  } catch (error) {
    ElMessage.error("Błąd ładowania szczegółów bloga");
  } finally {
    isLoading.value = false;
  }
}

async function loadComments() {
  const payload = {
    blogID: blogId,
  };
  try {
    const response = await api.blog.getByBlog(payload);
    comments.value = response.data;
  } catch (error) {
    ElMessage.error("Błąd ładowania komentarzy");
  }
}

function getImageUrl(imageName) {
  return new URL(`./img/${imageName}`, import.meta.url).href;
}

async function submitComment() {
  if (comment.value.trim() === "") {
    ElMessage.warning("Komentarz nie może być pusty");
    return;
  }

  const payload = {
    userID: globalStore.userID,
    blogID: blogId,
    comment: comment.value,
    userName: `${globalStore.userFirstName} ${globalStore.userLastName}`,
    date: new Date().toISOString(),
  };

  try {
    const response = await api.blog.commentBlog(payload);
    ElMessage.success("Komentarz został dodany!");
    showCommentDialog.value = false;
    comment.value = "";
    loadComments();
  } catch (error) {
    ElMessage.error("Błąd podczas dodawania komentarza");
  }
}

function openCommentDialog() {
  showCommentDialog.value = true;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}.${String(date.getDate()).padStart(2, "0")}`;
}

onMounted(() => {
  loadBlogDetails();
});
</script>

<template>
  <div v-if="isLoading" class="loading-container">
    <el-icon class="is-loading">
      <Loading />
    </el-icon>
  </div>

  <div v-else-if="blogDetails" class="blog-details-container">
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
    <div class="blog-comment-box">
      <el-button class="btn-primary" @click="openCommentDialog">
        Napisz komentarz
      </el-button>
    </div>

    <el-dialog
      v-model="showCommentDialog"
      title="Napisz komentarz"
      width="50%"
      center
    >
      <el-input
        type="textarea"
        v-model="comment"
        placeholder="Napisz swój komentarz tutaj..."
        rows="6"
      />
      <template #footer>
        <el-button @click="showCommentDialog = false">Anuluj</el-button>
        <el-button class="btn-primary" @click="submitComment"
          >Napisz komentarz</el-button
        >
      </template>
    </el-dialog>

    <div v-if="comments.length" class="comments-section">
      <h2 class="comments-title">Komentarze</h2>
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-header">
          <span class="comment-user">{{ comment.userName }}</span>
          <span class="comment-date">{{ formatDate(comment.date) }}</span>
        </div>
        <p class="comment-content">{{ comment.comment }}</p>
      </div>
    </div>
    <div v-else class="no-comments">
      <p>Brak komentarzy</p>
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
  width: 100%;
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

.write-comment-button {
  margin-top: 20px;
  display: block;
}

.comments-section {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.comments-title {
  font-size: 28px;
  margin-bottom: 20px;
  color: #333;
}

.comment-item {
  border: 1px solid #e0e0e0;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.comment-user {
  font-weight: 600;
  color: #333;
}

.comment-date {
  font-size: 14px;
  color: #9d9d9d;
}

.comment-content {
  font-size: 16px;
  color: #555;
  line-height: 1.5;
}

.blog-comment-box {
  display: flex;
  justify-content: center;
  margin-top: 25px;
}

.no-comments {
  margin-top: 20px;
  text-align: center;
  color: #9d9d9d;
}

@media (max-width: 768px) {
  .blog-details-top {
    height: 300px;
  }
  .blog-title {
    font-size: 24px;
  }
  .blog-details-img {
    max-width: 290px;
  }

  .comments-title {
    font-size: 24px;
  }

  .comment-item {
    padding: 10px;
  }

  .comment-content {
    font-size: 14px;
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500px;
}
</style>
