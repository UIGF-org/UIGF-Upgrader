/**
 * @file i18n/index.ts
 * @description 国际化
 * @since 2.0.0
 */
import chs from "./chs.json";
import en from "./en.json";
import { createI18n } from "vue-i18n";

// 浏览器语言转换为国际化语言
function getLocale() {
  const lang = navigator.language;
  if (lang.includes("zh")) {
    return "chs";
  }
  if (lang.includes("en")) {
    return "en";
  }
  if (lang.includes("ja")) {
    return "jp";
  }
  if (lang.includes("ko")) {
    return "kr";
  }
  return "en";
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getLocale(),
  messages: { chs, en },
});

export default i18n;
