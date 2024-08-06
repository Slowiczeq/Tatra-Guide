<template>
  <footer>
    <div class="container">
      <span class="footer-title">TATRA GUIDE</span>
      <div class="footer-list">
        <RouterLink to="/discover" class="footer-list-title"
          >Odkrywaj</RouterLink
        >
        <RouterLink to="/discover/for-child"
          >Trasy dla rodzin z dziećmi</RouterLink
        >
        <RouterLink to="/discover/for-beginner"
          >Trasy dla początkujących</RouterLink
        >
        <RouterLink to="/discover/for-advanced"
          >Trasy dla fanów adrenaliny</RouterLink
        >
        <RouterLink to="/discover/for-disabled"
          >Trasy dla wózków inwalidzkich</RouterLink
        >
      </div>
      <div class="footer-list">
        <RouterLink to="/challenges" class="footer-list-title"
          >Wyzwania</RouterLink
        >
        <RouterLink to="/challenges">Przejdź 5 tras</RouterLink>
        <RouterLink to="/challenges">Przejdź 30km</RouterLink>
        <RouterLink to="/challenges">Przejdź 100km</RouterLink>
      </div>
      <div class="footer-list">
        <RouterLink to="/routes" class="footer-list-title"
          >Dowiedz się więcej</RouterLink
        >
        <RouterLink to="/Blog">Blog</RouterLink>
        <RouterLink to="/routes">Wyszukaj trasę</RouterLink>
      </div>
    </div>
  </footer>
</template>
<style scoped>
footer {
  background: #4f4d49;
  margin-top: auto;
  padding: 60px 0;
}
.container {
  margin: 0 0;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
}
.footer-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}
a {
  color: #fff;
  text-decoration: unset;
}
.footer-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.footer-list-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
}
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    gap: 40px;
  }
}
</style>
