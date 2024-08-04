<script setup>
import { ref, computed, watch, onMounted } from "vue";
import api from "../../services/api";
import {
  ElMessage,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElButton,
  ElIcon,
  ElInput,
  ElCard,
  ElOptionGroup,
} from "element-plus";
import { useGlobalStore } from "../../stores/globalStore";
import Auth from "../../components/Login/Auth.vue";
import { Plus } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
const router = useRouter();

const globalStore = useGlobalStore();

let trailsData = ref([]);
async function loadTrails() {
  try {
    const response = await api.trails.loadTrails();
    trailsData.value = response.data;
  } catch (error) {
    ElMessage.error("Błąd ładowania listy tras");
  }
}

let userTrailsData = ref([]);

async function loadUserTrails() {
  const payload = {
    userID: globalStore.userID,
  };

  try {
    const response = await api.trails.userTrails(payload);
    userTrailsData.value = response.data;
  } catch (error) {
    ElMessage.error("Błąd ładowania tras użytkownika");
  }
}
onMounted(() => {
  if (globalStore.token) {
    loadTrails();
    loadUserTrails();
  }
});

const form = ref({
  name: "",
  days: 1,
  trips: [
    [
      {
        routeID: "",
        status: "planned",
        routeDist: 0,
        routeTime: "",
        trailName: "",
        timeStart: null,
        timeEnd: null,
        userTime: "",
      },
    ],
  ],
});

const selectedDays = computed(() => {
  return Array.from(
    { length: form.value.days },
    (_, i) =>
      form.value.trips[i] || [
        {
          routeID: "",
          status: "planned",
          routeDist: 0,
          routeTime: 0,
          trailName: "",
          timeStart: null,
          timeEnd: null,
          userTime: "",
        },
      ]
  );
});

watch(
  () => form.value.days,
  (newDays) => {
    form.value.trips = Array.from(
      { length: newDays },
      (_, i) =>
        form.value.trips[i] || [
          {
            routeID: "",
            status: "planned",
            routeDist: 0,
            routeTime: 0,
            trailName: "",
            timeStart: null,
            timeEnd: null,
            userTime: "",
          },
        ]
    );
  }
);

const addRoute = (dayIndex) => {
  form.value.trips[dayIndex].push({
    routeID: "",
    status: "planned",
    routeDist: 0,
    routeTime: 0,
    trailName: "",
    timeStart: null,
    timeEnd: null,
    userTime: "",
  });
};

const updateRouteData = (dayIndex, routeIndex) => {
  const selectedRouteID = form.value.trips[dayIndex][routeIndex].routeID;
  const selectedRoute = trailsData.value.find(
    (trail) => trail.id === selectedRouteID
  );
  if (selectedRoute) {
    form.value.trips[dayIndex][routeIndex].routeDist =
      selectedRoute.route_length;
    form.value.trips[dayIndex][routeIndex].routeTime = selectedRoute.route_time;
    form.value.trips[dayIndex][routeIndex].trailName = selectedRoute.trail_name;
    form.value.trips[dayIndex][routeIndex].status = "planned";
    form.value.trips[dayIndex][routeIndex].userTime = "";
  }
};

const isFormValid = computed(() => {
  return (
    form.value.name &&
    form.value.trips.every((day) => day.every((trip) => trip.routeID))
  );
});

const userSavedTrails = computed(() => {
  return userTrailsData.value
    .map((userTrail) => {
      const trail = trailsData.value.find(
        (trail) => trail.id === parseInt(userTrail.routeID)
      );
      return trail ? trail : null;
    })
    .filter((trail) => trail !== null);
});

const otherTrails = computed(() => {
  const userTrailIDs = userSavedTrails.value.map((trail) => trail.id);
  return trailsData.value.filter((trail) => !userTrailIDs.includes(trail.id));
});

async function saveTrip() {
  if (!isFormValid.value) {
    ElMessage.warning(
      "Uzupełnij wszystkie trasy i nazwę wycieczki przed zapisaniem"
    );
    return;
  }
  const payload = {
    userID: globalStore.userID,
    status: "started",
    trips: form.value.trips,
    name: form.value.name,
  };
  console.log(payload);
  try {
    const response = await api.trip.startNewTrip(payload);
    console.log(response.data);
    ElMessage.success("Wycieczka zapisana pomyślnie");
    router.push("/user/trips");
  } catch (error) {
    ElMessage.error("Błąd podczas zapisywania wycieczki");
  }
}
</script>

<template>
  <div class="container">
    <Auth v-if="!globalStore.token" />
    <div class="challenges-container" v-else>
      <span class="main-title challenges-main-title"
        >Stwórz swoją własną wycieczkę</span
      >
      <el-card class="trip-form-card">
        <el-form
          class="trip-form"
          ref="formRef"
          :model="form"
          label-position="top"
        >
          <el-form-item label="Nazwa wycieczki">
            <el-input v-model="form.name" placeholder="Wpisz nazwę wycieczki" />
          </el-form-item>
          <div class="trip-form-days">
            <span class="title">Wybierz na ile dni planujesz wycieczkę</span>
            <el-form-item style="margin-top: 20px" label="Ilość dni">
              <el-select v-model="form.days" placeholder="Wybierz ilość dni">
                <el-option
                  v-for="day in 7"
                  :key="day"
                  :label="day"
                  :value="day"
                >
                  {{ day }}
                </el-option>
              </el-select>
            </el-form-item>
          </div>

          <div
            class="form-days-box"
            v-for="(routes, index) in selectedDays"
            :key="index"
          >
            <el-card class="day-card">
              <template #header>
                <span class="form-days-title">Dzień {{ index + 1 }}</span>
              </template>
              <div
                v-for="(route, rIndex) in routes"
                :key="rIndex"
                class="route-selection"
              >
                <el-form-item
                  class="form-days-route"
                  label="Trasa"
                  style="width: 100%"
                >
                  <el-select
                    v-model="form.trips[index][rIndex].routeID"
                    placeholder="Wybierz trasę"
                    @change="updateRouteData(index, rIndex)"
                    filterable
                    style="width: 100%"
                  >
                    <el-option-group label="Zapisane trasy">
                      <el-option
                        v-for="trail in userSavedTrails"
                        :key="trail.id"
                        :label="trail.trail_name"
                        :value="trail.id"
                      >
                        {{ trail.trail_name }}
                      </el-option>
                    </el-option-group>
                    <el-option-group label="Pozostałe trasy">
                      <el-option
                        v-for="trail in otherTrails"
                        :key="trail.id"
                        :label="trail.trail_name"
                        :value="trail.id"
                      >
                        {{ trail.trail_name }}
                      </el-option>
                    </el-option-group>
                  </el-select>
                </el-form-item>
              </div>
              <el-button circle @click="addRoute(index)" type="primary">
                <el-icon color="#fff"><Plus /></el-icon>
              </el-button>
            </el-card>
          </div>
        </el-form>
        <div class="save-trip-button">
          <el-button :disabled="!isFormValid" type="primary" @click="saveTrip"
            >Zapisz wycieczkę</el-button
          >
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
}

.challenges-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.trip-form-card {
  width: 100%;
  padding: 20px;
}

.trip-form {
  width: 100%;
}

.trip-form-days {
  margin-bottom: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.form-days-box {
  margin-bottom: 20px;
}

.day-card {
  padding: 20px;
  margin-bottom: 20px;
}

.form-days-title {
  font-size: 20px;
  font-weight: bold;
}

.route-selection {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.save-trip-button {
  text-align: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .container {
    max-width: 320px;
  }
  .trip-form-card {
    padding: 0;
  }
}
</style>
