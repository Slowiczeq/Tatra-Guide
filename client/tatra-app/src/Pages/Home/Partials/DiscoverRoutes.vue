<script setup>
import { ref, computed } from "vue";
</script>

<template>
  <div class="container-wrapper">
    <div class="container">
      <div class="discover-left-side">
        <span class="discover-left-title"
          >Szlaki dopasowane do Twoich potrzeb</span
        >
        <span class="discover-left-text"
          >Poznaj trasy skrojone na miarę twoich oczekiwań</span
        >
        <div class="button-section-container">
          <RouterLink class="discover-left-link" to="/discover"
            >Odkrywaj</RouterLink
          >
        </div>
      </div>
      <div class="discover-right-side">
        <div class="discover-images">
          <RouterLink to="/discover/for-child">
            <span class="discover-right-text">Dla rodzin z dziećmi</span>
            <img src="../../../assets/img/route-img.png" alt="trasa" />
          </RouterLink>
        </div>

        <div class="discover-images">
          <RouterLink to="/discover/for-beginner">
            <span class="discover-right-text">Dla początkujących</span>
            <img src="../../../assets/img/route-img.png" alt="trasa" />
          </RouterLink>
        </div>

        <div class="discover-images">
          <RouterLink to="/discover/for-advanced">
            <span class="discover-right-text">Dla fanów adrenaliny</span>
            <img src="../../../assets/img/route-img.png" alt="trasa" />
          </RouterLink>
        </div>

        <div class="discover-images">
          <RouterLink to="/discover/for-disabled">
            <span class="discover-right-text">Dla wózków inwalidzkich</span>
            <img src="../../../assets/img/route-img.png" alt="trasa" />
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}
.discover-left-side {
  flex-basis: 40%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 40px;
}
.discover-left-title {
  font-weight: 500;
  font-size: 40px;
}
.discover-left-text {
  font-size: 30px;
  font-weight: 400;
}
.discover-left-link {
  background: #4f4d49;
  padding: 15px 40px;
  border-radius: 25px;
  color: #fff;
  text-decoration: unset;
  font-size: 25px;
  font-weight: 600;
}
.discover-right-side {
  flex-basis: 60%;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}
.discover-images {
  flex-basis: calc(50% - 15px);
  position: relative;
}
.discover-right-text {
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
.discover-images img {
  width: 100%;
}
@media (max-width: 1040px) {
  .discover-left-title {
    font-size: 24px;
    font-weight: 600;
  }
  .discover-left-text {
    font-size: 18px;
  }
  .discover-right-text {
    font-size: 12px;
  }
  .container {
    flex-direction: column;
    margin-top: 0;
    margin-bottom: 0;
  }
  .discover-right-side {
    flex-direction: column;
    width: 100%;
  }
  .discover-images {
    flex-basis: 100%;
    width: 100%;
  }
  .discover-left-link {
    padding: 15px 30px;
    font-size: 16px;
  }
  .discover-left-side {
    gap: 20px;
  }
  .button-section-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
}
</style>
