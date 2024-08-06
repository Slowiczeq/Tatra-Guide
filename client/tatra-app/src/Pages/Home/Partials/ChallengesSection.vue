<script setup>
import { ref, computed } from "vue";
</script>

<template>
  <div class="container">
    <div class="challenge-right-side">
      <div class="challenge-images">
        <img src="../../../assets/img/challenges.png" alt="trasa" />
      </div>
    </div>
    <div class="challenge-left-side-box">
      <div class="challenge-left-side">
        <span class="challenge-left-title">Głodny/a wyzwań?</span>
        <span class="challenge-left-text"
          >Weź udział w challengu, śledź swoje postępy i rywalizuj z innymi
          członkami naszej społeczności</span
        >
        <div class="button-section-container">
          <RouterLink class="challenge-left-link" to="/challenges"
            >Podejmij wyzwanie</RouterLink
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.challenge-left-side-box {
  display: flex;
  justify-content: center;
  align-items: center;
}
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.challenge-left-side {
  flex-basis: 60%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 40px;
}
.challenge-left-title {
  font-weight: 500;
  font-size: 40px;
}
.challenge-left-text {
  font-size: 30px;
  font-weight: 400;
}
.challenge-left-link {
  background: #4f4d49;
  padding: 15px 40px;
  border-radius: 25px;
  color: #fff;
  text-decoration: unset;
  font-size: 25px;
  font-weight: 600;
}
.challenge-right-side {
  flex-basis: 50%;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}
.challenge-images {
  width: 100%;
}
.challenge-right-text {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-shadow: 1px 1px black;
  white-space: nowrap;
}
.challenge-images img {
  width: 100%;
  border-radius: 20px;
}
@media (max-width: 768px) {
  .challenge-left-title {
    font-size: 24px;
    font-weight: 600;
  }
  .challenge-left-text {
    font-size: 18px;
  }
  .container {
    flex-direction: column;
    gap: 15px;
  }
  .challenge-left-side {
    flex-basis: 100%;
    gap: 20px;
  }
  .challenge-left-link {
    padding: 15px 30px;
    font-size: 16px;
  }
  .button-section-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
}
</style>
