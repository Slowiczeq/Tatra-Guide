<script setup>
import api from "../../../services/api";
import { ref, onMounted, computed, watch } from "vue";
import {
  ElMessage,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElButton,
  ElCard,
  ElInput,
  ElDatePicker,
  ElTimeSelect,
  ElOptionGroup,
  ElIcon,
} from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { useGlobalStore } from "../../../stores/globalStore";
import { Plus } from "@element-plus/icons-vue";

const globalStore = useGlobalStore();
const route = useRoute();
const router = useRouter();
const id = route.params.id;

const tripData = ref(null);
const trailsData = ref([]);
const userTrailsData = ref([]);
const isLoading = ref(true); // Zmienna do śledzenia stanu ładowania
const form = ref({
  name: "",
  days: 1,
  trips: [],
});

async function loadTrip() {
  try {
    const payload = { tripID: id };
    const response = await api.trip.getTripById(payload);
    tripData.value = response.data;

    form.value.name = tripData.value.name;
    form.value.days = tripData.value.trips.length;
    form.value.trips = tripData.value.trips.map((day) =>
      day.map((trip) => ({
        ...trip,
        userTime: trip.userTime || "",
      }))
    );
  } catch (error) {
    ElMessage.error("Błąd ładowania danych wycieczki");
  }
}

async function loadTrails() {
  try {
    const response = await api.trails.loadTrails();
    trailsData.value = response.data;
  } catch (error) {
    ElMessage.error("Błąd ładowania listy tras");
  }
}

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

onMounted(async () => {
  await Promise.all([loadTrip(), loadTrails(), loadUserTrails()]);
  isLoading.value = false; // Ustawienie zakończenia ładowania
});

const selectedDays = computed(() => {
  return Array.from(
    { length: form.value.days },
    (_, i) => form.value.trips[i] || []
  );
});

// Dodanie pustej trasy przy zmianie ilości dni
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
    form.value.trips[dayIndex][routeIndex].trailName = selectedRoute.trail_name;
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
    tripID: id,
    name: form.value.name,
    trips: form.value.trips,
    userID: globalStore.userID,
  };
  try {
    await api.trip.updateTrip(payload);
    ElMessage.success("Wycieczka zapisana pomyślnie");
    router.push("/user/trips");
  } catch (error) {
    ElMessage.error("Błąd podczas zapisywania wycieczki");
  }
}
</script>

<template>
  <div class="container">
    <span class="main-title challenges-main-title">Edytuj wycieczkę</span>
    <div v-if="isLoading" class="loading-container">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
    </div>
    <el-form
      v-else
      ref="formRef"
      :model="form"
      label-width="auto"
      label-position="top"
    >
      <el-form-item label="Nazwa wycieczki">
        <el-input v-model="form.name" placeholder="Wpisz nazwę wycieczki" />
      </el-form-item>
      <div class="trip-form-days">
        <span class="title">Wybierz na ile dni planujesz wycieczkę</span>
        <el-form-item style="margin-top: 20px" label="Ilość dni">
          <el-select v-model="form.days" placeholder="Wybierz ilość dni">
            <el-option v-for="day in 7" :key="day" :label="day" :value="day">
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
            <div class="edit-small-box">
              <el-form-item
                class="form-days-route edit-small-box-element"
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

              <el-form-item class="edit-small-box-element" label="Status">
                <el-select
                  v-model="form.trips[index][rIndex].status"
                  placeholder="Wybierz status"
                >
                  <el-option label="Zaplanowana" value="planned"></el-option>
                  <el-option label="Zakończona" value="ended"></el-option>
                </el-select>
              </el-form-item>
            </div>

            <div class="edit-big-box">
              <el-form-item
                class="edit-big-box-element"
                label="Czas użytkownika"
              >
                <el-time-select
                  v-model="form.trips[index][rIndex].userTime"
                  style="width: 240px"
                  start="00:00"
                  step="00:01"
                  end="20:00"
                  placeholder="Wybierz czas"
                />
              </el-form-item>

              <el-form-item
                class="edit-big-box-element"
                label="Data rozpoczęcia"
              >
                <el-date-picker
                  v-model="form.trips[index][rIndex].timeStart"
                  type="date"
                  placeholder="Wybierz datę"
                />
              </el-form-item>

              <el-form-item
                class="edit-big-box-element"
                label="Data zakończenia"
              >
                <el-date-picker
                  v-model="form.trips[index][rIndex].timeEnd"
                  type="date"
                  placeholder="Wybierz datę"
                />
              </el-form-item>
            </div>

            <el-button
              @click="
                form.trips[index].length > 1 &&
                  form.trips[index].splice(rIndex, 1)
              "
              type="danger"
              :disabled="form.trips[index].length <= 1"
              style="width: 150px"
              >Usuń</el-button
            >
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
  </div>
</template>

<style scoped>
.main-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-days-title {
  font-size: 20px;
  font-weight: bold;
}

.route-selection {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  gap: 20px;
  border-bottom: 1px solid var(--el-card-border-color);
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.save-trip-button {
  text-align: center;
  margin-top: 20px;
}

@media (min-width: 1040px) {
  .container {
    max-width: 1200px;
    width: 1000px;
    margin: auto;
    padding: 20px;
  }
  .edit-big-box {
    display: flex;
  }
  .edit-big-box-element {
    flex-basis: 33.33%;
  }
  .edit-small-box {
    display: flex;
    gap: 60px;
  }
  .edit-small-box-element {
    flex-basis: 50%;
  }
}
@media (max-width: 768px) {
  .main-title {
    margin-top: 30px;
  }
}
</style>
