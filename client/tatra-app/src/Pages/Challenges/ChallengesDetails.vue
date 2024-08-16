<script setup>
import { useGlobalStore } from "../../stores/globalStore";
import api from "../../services/api";
import { ref, onMounted } from "vue";
import {
  ElMessage,
  ElCard,
  ElButton,
  ElProgress,
  ElTag,
  ElIcon,
} from "element-plus";
import Auth from "../../components/Login/Auth.vue";
import { useRoute } from "vue-router";
import { Loading } from "@element-plus/icons-vue";

const globalStore = useGlobalStore();
const route = useRoute();
const id = route.params.id;

let challengesListData = ref([]);
let userChallenges = ref([]);
let isLoading = ref(true);

async function challengesList() {
  try {
    const response = await api.challenges.challengesList();
    challengesListData.value = response.data.filter((item) => item.id == id);
    await loadUserChallenges();
  } catch (error) {
    ElMessage.error("Błąd ładowania wyzwania");
  } finally {
    isLoading.value = false;
  }
}

async function loadUserChallenges() {
  const payload = {
    userID: globalStore.userID,
  };

  try {
    const response = await api.challenges.userChallenges(payload);
    userChallenges.value = response.data.filter(
      (item) => item.challengeID == id
    );
  } catch (error) {
    ElMessage.error("Błąd ładowania wyzwania");
  }
}

async function startChallenge(id, type, value) {
  const payload = {
    userID: globalStore.userID,
    challengeID: id,
    status: "rozpoczęto",
    challangeType: type,
    challengeValue: value,
    timeStart: new Date().toISOString(),
  };
  try {
    const response = await api.challenges.startChallenge(payload);
    userChallenges.value.push(response.data);
    ElMessage.success("Wyzwanie rozpoczęte");
  } catch (error) {
    ElMessage.error("Błąd podczas rozpoczynania wyzwania");
  }
}

function getChallengeStatus(challengeID) {
  const challenge = userChallenges.value.find(
    (challenge) => challenge.challengeID == challengeID
  );
  return challenge || null;
}

function getPercentage(challenge) {
  return Math.round(
    (challenge.challangeProgress / challenge.challengeValue) * 100
  );
}

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

onMounted(() => {
  if (globalStore.token) {
    challengesList();
  }
});
</script>

<template>
  <div class="container">
    <Auth v-if="!globalStore.token" />
    <div class="challenges-container" v-else>
      <span
        v-if="challengesListData.length > 0"
        class="main-title challenges-main-title"
        >{{ challengesListData[0].name }}</span
      >

      <div v-if="isLoading" class="loading-container">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
      </div>

      <div v-else class="challenges-items-container">
        <el-card
          v-for="(item, index) in challengesListData"
          :key="index"
          class="challenges-item"
        >
          <template #header>
            <span class="challenges-title">Szczegóły wyzwania</span>
            <span class="challenges-details">{{ item.description }}</span>
          </template>
          <div
            style="display: flex; justify-content: center"
            v-if="!getChallengeStatus(item.id)"
          >
            <el-button
              class="btn-primary"
              @click="
                startChallenge(item.id, item.challengeType, item.challengeValue)
              "
              type="primary"
              plain
              >Rozpocznij wyzwanie</el-button
            >
          </div>
          <div
            class="progress-container"
            v-else-if="getChallengeStatus(item.id).status === 'rozpoczęto'"
          >
            <el-progress
              :text-inside="true"
              :stroke-width="26"
              :percentage="getPercentage(getChallengeStatus(item.id))"
            />
            <div class="challenge-status-box">
              <div class="progress-statuses">
                <el-tag type="info"
                  >Postęp:
                  {{
                    getRoundedProgress(
                      getChallengeStatus(item.id).challangeProgress
                    )
                  }}</el-tag
                >
                <el-tag type="success"
                  >Cel: {{ getChallengeStatus(item.id).challengeValue }}</el-tag
                >
              </div>
              <div class="progress-statuses">
                <el-tag type="warning" class="challenge-status__in-progress"
                  >W trakcie wyzwania</el-tag
                >
              </div>
              <div class="delete-challenge-button">
                <el-button @click="deleteUserChallenge(item.id)"
                  >Anuluj</el-button
                >
              </div>
            </div>
          </div>
          <div
            v-else-if="getChallengeStatus(item.id).status === 'zakończono'"
            class=""
          >
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
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1000px;
}

.challenges-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.challenges-items-container {
  display: grid;
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
}
</style>
