<script setup>
import { ref, onMounted } from "vue";
import api from "../../../services/api";
import {
  ElMessage,
  ElTable,
  ElTableColumn,
  ElButton,
  ElCard,
  ElIcon,
  ElDialog,
  ElForm,
  ElFormItem,
  ElTimeSelect,
  ElDatePicker,
} from "element-plus";
import { useGlobalStore } from "../../../stores/globalStore";
import { RouterLink } from "vue-router";
import { Edit, Delete } from "@element-plus/icons-vue";
import { format } from "date-fns";

const globalStore = useGlobalStore();

let tripsData = ref([]);
const isMobile = ref(window.innerWidth < 768);

window.addEventListener("resize", () => {
  isMobile.value = window.innerWidth < 768;
});

async function loadTrips() {
  const payload = {
    userID: globalStore.userID,
  };

  try {
    const response = await api.trip.getTrips(payload);
    tripsData.value = response.data;
  } catch (error) {
    ElMessage.error("Błąd ładowania wycieczek użytkownika");
  }
}

const modalVisible = ref(false);
const currentTripID = ref(null);
const currentDayIndex = ref(null);
const currentRouteIndex = ref(null);
const form = ref({
  userTime: "",
  timeStart: "",
  timeEnd: "",
});

function openModal(tripID, dayIndex, routeIndex) {
  currentTripID.value = tripID;
  currentDayIndex.value = dayIndex;
  currentRouteIndex.value = routeIndex;

  const route = tripsData.value.find((trip) => trip.id === tripID).trips[
    dayIndex
  ][routeIndex];

  form.value.userTime = route.userTime || "";
  form.value.timeStart = route.timeStart ? new Date(route.timeStart) : "";
  form.value.timeEnd = route.timeEnd ? new Date(route.timeEnd) : "";

  modalVisible.value = true;
}

async function submitEndRoute() {
  const payload = {
    tripID: currentTripID.value,
    dayIndex: currentDayIndex.value,
    routeIndex: currentRouteIndex.value,
    userID: globalStore.userID,
    userTime: form.value.userTime,
    timeStart: form.value.timeStart,
    timeEnd: form.value.timeEnd,
  };

  try {
    const response = await api.trip.endRoute(payload);
    updateRouteStatus(
      currentTripID.value,
      currentDayIndex.value,
      currentRouteIndex.value,
      "ended",
      form.value.timeStart,
      form.value.timeEnd
    );
    ElMessage.success("Trasa zakończona");
    modalVisible.value = false;
  } catch (error) {
    ElMessage.error("Błąd podczas zakańczania trasy");
  }
}

function updateRouteStatus(
  tripID,
  dayIndex,
  routeIndex,
  status,
  timeStart = null,
  timeEnd = null
) {
  const trip = tripsData.value.find((trip) => trip.id === tripID);
  if (trip) {
    trip.trips[dayIndex][routeIndex].status = status;
    if (timeStart) {
      trip.trips[dayIndex][routeIndex].timeStart = timeStart;
    }
    if (timeEnd) {
      trip.trips[dayIndex][routeIndex].timeEnd = timeEnd;
    }

    const allRoutesEnded = trip.trips.every((day) =>
      day.every((route) => route.status === "ended")
    );
    const anyRoutePlanned = trip.trips.some((day) =>
      day.some((route) => route.status === "planned")
    );

    if (allRoutesEnded) {
      trip.status = "finished";
    } else if (anyRoutePlanned) {
      trip.status = "started";
    } else {
      trip.status = "planned";
    }
  }
}

function formatRouteStatus(status) {
  switch (status) {
    case "planned":
      return "Zaplanowana";
    case "ended":
      return "Zakończona";
    default:
      return status;
  }
}

function formatDateTime(dateTime) {
  return format(new Date(dateTime), "yyyy-MM-dd");
}

onMounted(() => {
  loadTrips();
});
</script>

<template>
  <div>
    <span class="main-title challenges-main-title">Moje wycieczki</span>
    <div v-if="tripsData.length > 0">
      <el-card v-for="trip in tripsData" :key="trip.id" class="trip-item">
        <div class="trip-header">
          <h3 class="trip-title">Wycieczka - {{ trip.name }}</h3>
          <div class="trip-actions">
            <RouterLink :to="`/user/trips/${trip.id}`">
              <el-icon><Edit /></el-icon>
            </RouterLink>
            <el-icon @click="deleteTrip(trip.id)" style="cursor: pointer">
              <Delete />
            </el-icon>
          </div>
        </div>

        <div v-if="!isMobile">
          <div v-for="(routes, dayIndex) in trip.trips" :key="dayIndex">
            <h4 class="day-h4">Dzień {{ dayIndex + 1 }}</h4>
            <el-table :data="routes" style="width: 100%">
              <el-table-column width="155" label="Nazwa trasy">
                <template #default="{ row }">
                  <RouterLink :to="`/route/${row.routeID}`">
                    {{ row.trailName }}
                  </RouterLink>
                </template>
              </el-table-column>
              <el-table-column
                prop="routeDist"
                label="Dystans (km)"
              ></el-table-column>
              <el-table-column
                prop="routeTime"
                label="Średni czas"
              ></el-table-column>
              <el-table-column label="Mój czas">
                <template #default="{ row }"> {{ row.userTime }} </template>
              </el-table-column>
              <el-table-column label="Status">
                <template #default="{ row }">
                  {{ formatRouteStatus(row.status) }}
                </template>
              </el-table-column>
              <el-table-column label="Czas rozpoczęcia">
                <template #default="{ row }">
                  <span v-if="row.timeStart">{{
                    formatDateTime(row.timeStart)
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Czas zakończenia">
                <template #default="{ row }">
                  <span v-if="row.timeEnd">{{
                    formatDateTime(row.timeEnd)
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Akcje">
                <template #default="{ row, $index }">
                  <el-button
                    v-if="row.status === 'planned'"
                    @click="openModal(trip.id, dayIndex, $index)"
                    type="primary"
                  >
                    Zakończ
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <div v-else>
          <div
            v-for="(routes, dayIndex) in trip.trips"
            :key="dayIndex"
            class="mobile-trip"
          >
            <h4 class="day-h4">Dzień {{ dayIndex + 1 }}</h4>
            <div
              v-for="(route, routeIndex) in routes"
              :key="routeIndex"
              class="mobile-route"
            >
              <p>
                <strong>Nazwa trasy: </strong>
                <RouterLink :to="`/route/${route.routeID}`">{{
                  route.trailName
                }}</RouterLink>
              </p>
              <p><strong>Dystans (km): </strong>{{ route.routeDist }}</p>
              <p><strong>Średni czas: </strong>{{ route.routeTime }}</p>
              <p><strong>Mój czas: </strong>{{ route.userTime }}</p>
              <p>
                <strong>Status: </strong>{{ formatRouteStatus(route.status) }}
              </p>
              <p>
                <strong>Czas zakończenia: </strong>
                <span v-if="route.timeEnd">{{
                  formatDateTime(route.timeEnd)
                }}</span>
              </p>
              <div class="button-end-route" v-if="route.status === 'planned'">
                <el-button
                  @click="openModal(trip.id, dayIndex, routeIndex)"
                  type="primary"
                >
                  Zakończ
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    <div class="trips-empty" v-else>
      <p>Brak wycieczek do wyświetlenia.</p>
    </div>

    <el-dialog
      class="end-trip-dialog"
      v-model="modalVisible"
      :visible.sync="modalVisible"
      title="Zakończ trasę"
    >
      <el-form>
        <el-form-item label="Czas użytkownika">
          <el-time-select
            v-model="form.userTime"
            start="00:00"
            step="00:01"
            end="20:00"
            placeholder="Wybierz czas"
          />
        </el-form-item>

        <el-form-item label="Data rozpoczęcia">
          <el-date-picker
            v-model="form.timeStart"
            type="date"
            placeholder="Wybierz datę"
          />
        </el-form-item>

        <el-form-item label="Data zakończenia">
          <el-date-picker
            v-model="form.timeEnd"
            type="date"
            placeholder="Wybierz datę"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitEndRoute">Zakończ</el-button>
          <el-button @click="modalVisible = false">Anuluj</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
}

.main-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.trip-item {
  margin-bottom: 20px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trip-actions {
  display: flex;
  gap: 10px;
}

.day-h4 {
  margin: 10px 0;
  margin-top: 20px;
}

.trips-empty {
  text-align: center;
  font-size: 18px;
  color: #999;
}

.trip-title {
  font-size: 24px;
  font-weight: 700;
}

a {
  color: black !important;
}

.mobile-trip {
  padding: 10px 0;
}

.mobile-route {
  border-bottom: 1px solid #ebeef5;
  padding: 10px 0;
}

@media (max-width: 768px) {
  .container {
    margin-top: 20px;
    margin-bottom: 20px;
  }
  .trip-item {
    padding: 10px;
  }
  .button-end-route {
    margin-top: 10px;
  }
  .mobile-route p {
    margin-bottom: 3px;
  }
}
</style>
