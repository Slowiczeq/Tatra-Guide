import "./assets/scss/index.scss";

import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import { createPinia } from "pinia";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import App from "./App.vue";
import router from "./router";
import { ApiPlugin } from "./plugins/api";

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(createPinia());
app.use(ElementPlus);
app.use(router);
app.use(ApiPlugin);

app.mount("#app");
