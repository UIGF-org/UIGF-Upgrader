/**
 * @file main.ts
 * @description 主入口
 * @since 2.0.0
 */

import { createApp } from "vue";
import App from "./App.vue";
import i18n from "./i18n";
import ArcoVue from "@arco-design/web-vue";
import ArcoVueIcon from "@arco-design/web-vue/es/icon";
import "@arco-design/web-vue/dist/arco.css";

createApp(App).use(ArcoVue).use(ArcoVueIcon).use(i18n).mount("#app");
