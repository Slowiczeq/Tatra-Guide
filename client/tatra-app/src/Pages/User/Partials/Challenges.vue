<script setup>
import { useGlobalStore } from "../../../stores/globalStore";
import api from "../../../services/api";
import { ref, onMounted, computed } from "vue";
import { ElMessage, ElCard, ElTable, ElTableColumn } from "element-plus";
import { format } from "date-fns";
import Auth from "../../../components/Login/Auth.vue";
import { RouterLink } from "vue-router";
import UserTrips from "../../Trip/Partials/UserTrips.vue";

const globalStore = useGlobalStore();

let userData = ref(null);

async function loadData() {
  if (globalStore.token) {
    try {
      const response = await api.auth.userInfo(globalStore.userID);
      userData.value = response.data;
    } catch (error) {
      ElMessage.error("Błąd ładowania danych");
    }
  }
}

onMounted(() => {
  loadData();
});

const userChallenges = computed(() => {
  if (!userData.value) return [];

  return userData.value.userChallenges.map((userChallenge) => {
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
</script>

<template>
  <div class="container">
    <Auth v-if="!globalStore.token" />
    <div v-else>
      <el-card class="challenges-card">
        <div class="header">Moje Wyzwania</div>
        <el-table :data="userChallenges">
          <el-table-column
            width="140"
            prop="name"
            label="Nazwa wyzwania"
          ></el-table-column>
          <el-table-column
            width="135"
            prop="challangeType"
            label="Typ wyzwania"
          ></el-table-column>
          <el-table-column
            width="130"
            prop="challangeProgress"
            label="Postęp"
          ></el-table-column>
          <el-table-column
            width="130"
            prop="challengeValue"
            label="Wartość"
          ></el-table-column>
          <el-table-column width="140" label="Status">
            <template #default="{ row }">
              {{ row.status === "zakończono" ? "Zakończono" : "W trakcie" }}
            </template>
          </el-table-column>
          <el-table-column width="140" label="Czas rozpoczęcia">
            <template #default="{ row }">
              <span>{{ formatDate(row.timeStart) }}</span>
            </template>
          </el-table-column>
          <el-table-column width="140" label="Czas zakończenia">
            <template #default="{ row }">
              <span>{{ formatDate(row.timeEnd) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
}
.header {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}
.challenges-card {
  margin-bottom: 20px;
}
</style>
