<script setup>
import { useGlobalStore } from "../../../stores/globalStore";
import api from "../../../services/api";
import { ref, onMounted, computed } from "vue";
import { ElMessage, ElCard, ElProgress, ElTag, ElIcon } from "element-plus";
import { format } from "date-fns";
import Auth from "../../../components/Login/Auth.vue";
import { RouterLink } from "vue-router";
import { Loading } from "@element-plus/icons-vue";

const globalStore = useGlobalStore();

let userData = ref(null);
let isLoading = ref(true); // Dodano zmienną śledzącą stan ładowania

async function loadData() {
  if (globalStore.token) {
    try {
      const response = await api.auth.userInfo(globalStore.userID);
      userData.value = response.data;
    } catch (error) {
      ElMessage.error("Błąd ładowania danych");
    } finally {
      isLoading.value = false; // Zakończenie ładowania
    }
  }
}

onMounted(() => {
  loadData();
});

const userChallenges = computed(() => {
  if (!userData.value) return [];
  return userData.value.userChallenges
    .filter(
      (userChallenge) =>
        userChallenge.status === "rozpoczęto" ||
        userChallenge.status === "zakończono"
    )
    .map((userChallenge) => {
      const challenge = userData.value.challenges.find(
        (ch) => ch.id == userChallenge.challengeID
      );
      return {
        ...userChallenge,
        name: challenge ? challenge.name : "Nieznane wyzwanie",
      };
    });
});

const formatDate = (dateString) => {
  return dateString ? format(new Date(dateString), "yyyy-MM-dd HH:mm") : "N/A";
};

const getPercentage = (challenge) => {
  return Math.round(
    (challenge.challangeProgress / challenge.challengeValue) * 100
  );
};

function getRoundedProgress(progress) {
  return Math.round(progress);
}
async function deleteUserChallenge(id) {
  const payload = {
    userID: globalStore.userID,
    challengeID: id,
  };
  try {
    const response = await api.challenges.deleteUserChallenge(payload);
    window.location.reload();
  } catch (error) {
    ElMessage.error("Błąd podczas anulowania wyzwania");
  }
}
</script>

<template>
  <div class="container">
    <Auth v-if="!globalStore.token" />
    <div class="challenges-container" v-else>
      <span class="main-title challenges-main-title">Moje Wyzwania</span>
      <div v-if="isLoading" class="loading-container">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
      </div>
      <div v-else class="challenges-items-container">
        <el-card
          v-for="(item, index) in userChallenges"
          :key="index"
          class="challenges-item"
        >
          <template #header>
            <RouterLink
              class="challenges-title"
              :to="`/challenges/${item.challengeID}`"
            >
              <span class="challenges-title">{{ item.name }}</span>
            </RouterLink>
          </template>
          <div class="progress-container" v-if="item.status === 'rozpoczęto'">
            <el-progress
              :text-inside="true"
              :stroke-width="26"
              :percentage="getPercentage(item)"
            />
            <div class="challenge-status-box">
              <div class="progress-statuses">
                <el-tag type="info"
                  >Postęp:
                  {{ getRoundedProgress(item.challangeProgress) }}</el-tag
                >
                <el-tag type="success">Cel: {{ item.challengeValue }}</el-tag>
              </div>
              <div class="progress-statuses">
                <el-tag type="warning" class="challenge-status__in-progress"
                  >W trakcie wyzwania</el-tag
                >
              </div>
            </div>
            <div class="challenge-dates">
              <el-tag type="info"
                >Data rozpoczęcia: {{ formatDate(item.timeStart) }}</el-tag
              >
            </div>
            <div class="delete-challenge-button">
              <el-button @click="deleteUserChallenge(item.challengeID)"
                >Anuluj</el-button
              >
            </div>
          </div>
          <div v-else-if="item.status === 'zakończono'">
            <el-progress
              :text-inside="true"
              :stroke-width="26"
              :percentage="100"
              status="success"
            />
            <div class="progress-statuses">
              <el-tag type="success" class="challenge-status__finished"
                >Wyzwanie zakończone</el-tag
              >
            </div>
            <div class="challenge-dates">
              <el-tag type="info"
                >Data rozpoczęcia: {{ formatDate(item.timeStart) }}</el-tag
              >
              <el-tag type="info"
                >Data zakończenia: {{ formatDate(item.timeEnd) }}</el-tag
              >
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
}

.challenges-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.challenges-items-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  width: 100%;
}

.challenges-item {
  padding: 20px;
}

.challenges-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  display: block;
  text-align: center;
  color: #000;
  text-decoration: unset;
}

.challenge-status-box {
  margin-top: 10px;
}

.challenge-status__in-progress {
  margin-top: 10px;
}

.challenge-status__finished {
  margin-top: 10px;
}

.progress-statuses {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.challenge-dates {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
.delete-challenge-button {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .main-title {
    font-size: 24px;
    margin-top: 20px;
    margin-bottom: 0;
  }
  .progress-container {
    width: 100%;
  }
  .container {
    margin-top: 20px;
    margin-bottom: 20px;
  }
}
</style>
