<template>
  <div class="app-container">
    <a-config-provider :locale="compLocale">
      <div class="app-title">
        <div class="app-title__left">
          <img src="/logo.png" alt="logo" />
          <span>UIGF Upgrader</span>
        </div>
        <div class="app-title__right">
          <a-dropdown @select="switchLang">
            <a-button>
              <template #icon>
                <icon-language />
              </template>
            </a-button>
            <template #content>
              <a-doption value="en">English</a-doption>
              <a-doption value="chs">简体中文</a-doption>
            </template>
          </a-dropdown>
        </div>
      </div>
      <div class="app-result">
        <a-upload
          draggable
          @change="changeFile"
          accept=".json"
          :custom-request="uploadFile"
          :multiple="false"
        />
      </div>
      <div class="box-container">
        <a-alert class="box-alert" v-if="msgTitle !== ''" :type="resMsg.type">
          <template #title>{{ msgTitle }}</template>
          <span style="white-space: pre-wrap">{{ msgMsg }}</span>
          <template #action>
            <div v-if="newData">
              <a-download v-if="newData" :data="newData" :filename="`UIGF-Upgrader-${curTs}.json`">
                <a-button id="downloadBtn" type="primary">{{ t("下载") }}</a-button>
              </a-download>
            </div>
          </template>
        </a-alert>
        <textarea :value="validJson" v-if="validJson" />
        <div v-if="info.length !== 0" class="info-container">
          <div class="info-item" v-for="item in info" :key="item.key">
            <span>{{ t(item.key) }}</span>
            <span>{{ item.value }}</span>
          </div>
        </div>
      </div>
    </a-config-provider>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, shallowRef, watch } from "vue";
import { Message, RequestOption, UploadRequest } from "@arco-design/web-vue";
import enUS from "@arco-design/web-vue/es/locale/lang/en-us.js";
import zhCN from "@arco-design/web-vue/es/locale/lang/zh-cn.js";
import ADownload from "@comp/a-download.vue";
import parseJson, { JsonParseType } from "@utils/parseJson.ts";
import upgradeTool from "@utils/upgrade.ts";
import { useI18n } from "vue-i18n";
import { type ArcoLang } from "@arco-design/web-vue/es/locale/interface";
import { formatTimestamp } from "@utils/formatTime.ts";

type ParseItem = { key: string; value: string };
type ParseInfo = Array<ParseItem>;
type AlertType = "normal" | "error" | "success" | "warning" | "info";
type AlertMsg = { type: AlertType; msg: string | (() => string); title: string | (() => string) };

const langDict: Readonly<Record<string, string>> = {
  "zh-cn": "chs",
  "zh-tw": "cht",
  "de-de": "de",
  "en-us": "en",
  "es-es": "es",
  "fr-fr": "fr",
  "id-id": "id",
  "ja-jp": "jp",
  "ko-kr": "kr",
  "pt-pt": "pt",
  "ru-ru": "ru",
  "th-th": "th",
  "vi-vn": "vi",
};

const { t, locale } = useI18n();
const oldData = shallowRef<string>("");
const validJson = ref<string>();
const newData = shallowRef<UIGF4.Schema>();
const resMsg = shallowRef<AlertMsg>({ type: "normal", msg: "", title: () => "" });
const info = shallowRef<ParseInfo>([]);
const itemIdDict = shallowRef<Record<string, number>>();
const compLocale = shallowRef<ArcoLang>(getCompLang());
const curTs = computed<number>(() => Date.now());
const msgTitle = computed<string>(() => {
  if (typeof resMsg.value.title === "function") return resMsg.value.title();
  return resMsg.value.title;
});
const msgMsg = computed<string>(() => {
  if (typeof resMsg.value.msg === "function") return resMsg.value.msg();
  return resMsg.value.msg;
});

watch(
  () => oldData.value,
  async () => {
    if (oldData.value !== "") await loadData(oldData.value);
  },
);

function getCompLang(): ArcoLang {
  switch (locale.value) {
    case "chs":
      return zhCN;
    default:
      return enUS;
  }
}

function switchLang(lang: string): void {
  locale.value = lang;
  compLocale.value = getCompLang();
}

async function refreshItemIdDict(lang: string): Promise<void> {
  const dictUrl = `https://api.uigf.org/dict/genshin/${lang}.json`;
  try {
    const res = await fetch(dictUrl);
    itemIdDict.value = await res.json();
  } catch (err) {
    Message.error(t("获取物品 ID 字典失败: x", JSON.stringify(err)));
    console.error(err);
  }
}

async function loadData(data: string): Promise<void> {
  const res = parseJson(data);
  if (res.type === JsonParseType.Unknown) {
    resMsg.value = { type: "warning", msg: res.data, title: () => t("未知错误") };
    return;
  }
  if (res.type === JsonParseType.Error) {
    resMsg.value = { type: "error", msg: res.data, title: () => t("解析异常") };
    return;
  }
  if (res.type === JsonParseType.Invalid) {
    const error = res.data[0];
    const errJson = JSON.parse(data);
    const path = error.instancePath.split("/");
    let target = errJson;
    for (let i = 1; i < path.length - 1; i++) {
      target = target[path[i]];
    }
    resMsg.value = {
      type: "error",
      msg: JSON.stringify(target, null, 2),
      title: () => t("校验异常：x", [`${res.data[0].instancePath} ${res.data[0].message}`]),
    };
    return;
  }
  if (res.type === JsonParseType.Uigf41) {
    resMsg.value = { type: "info", title: () => t("检测到 UIGFvx", ["4.1"]), msg: () => t("无需升级") };
    info.value = [
      { key: "UIGF版本", value: res.data.info.version },
      { key: "导出应用", value: res.data.info.export_app },
      { key: "导出应用版本", value: res.data.info.export_app_version },
      { key: "导出时间", value: formatTimestamp(res.data.info.export_timestamp) },
    ];
    return;
  }
  if (res.type === JsonParseType.Uigf4) {
    resMsg.value = { type: "info", title: () => t("检测到 UIGFvx", ["4.0"]), msg: () => t("无需升级") };
    info.value = [
      { key: "UIGF版本", value: res.data.info.version },
      { key: "导出应用", value: res.data.info.export_app },
      { key: "导出应用版本", value: res.data.info.export_app_version },
      { key: "导出时间", value: formatTimestamp(res.data.info.export_timestamp) },
    ];
    return;
  }
  if (res.type === JsonParseType.Srgf) {
    resMsg.value = {
      type: "info",
      title: () => t("检测到 SRGFvx", [res.data.info.srgf_version]),
      msg: () => t("升级为 UIGFv4.1"),
    };
    info.value = [
      { key: "SRGF版本", value: res.data.info.srgf_version },
      { key: "UID", value: res.data.info.uid },
      { key: "语言", value: res.data.info.lang },
      { key: "导出应用", value: `${res.data.info.export_app}` },
      { key: "导出应用版本", value: `${res.data.info.export_app_version}` },
      { key: "导出时间", value: formatTimestamp(res.data.info.export_timestamp, res.data.info.uid) },
    ];
    newData.value = upgradeTool.srgf(res.data);
    return;
  }
  if (res.type === JsonParseType.Uigf3) {
    resMsg.value = { type: "info", title: () => t("检测到 UIGFvx", ["3.0"]), msg: () => t("升级为 UIGFv4.1") };
    info.value = [
      { key: "UIGF版本", value: res.data.info.uigf_version },
      { key: "UID", value: res.data.info.uid },
      { key: "导出应用", value: `${res.data.info.export_app}` },
      { key: "导出应用版本", value: `${res.data.info.export_app_version}` },
      { key: "导出时间", value: formatTimestamp(res.data.info.export_timestamp, res.data.info.uid) },
    ];
    newData.value = upgradeTool.uigf3(res.data);
    return;
  }
  if (res.type === JsonParseType.Uigf24 || res.type === JsonParseType.Uigf23) {
    resMsg.value = {
      type: "info",
      title: () => t("检测到 UIGFvx", [res.data.info.uigf_version]),
      msg: () => t("升级为 UIGFv4.1"),
    };
    const regionTimeZone = "region_time_zone" in res.data.info ? res.data.info.region_time_zone : undefined;
    info.value = [
      { key: "UIGF版本", value: res.data.info.uigf_version },
      { key: "UID", value: res.data.info.uid },
      { key: "导出应用", value: `${res.data.info.export_app}` },
      { key: "导出应用版本", value: `${res.data.info.export_app_version}` },
      { key: "导出时间", value: formatTimestamp(res.data.info.export_timestamp, res.data.info.uid, regionTimeZone) },
    ];
    newData.value = upgradeTool.uigf2(res.data);
    return;
  }
  if (res.type === JsonParseType.Uigf22) {
    resMsg.value = { type: "info", title: () => t("检测到 UIGFvx", ["2.2"]), msg: () => t("升级为 UIGFv4.1") };
    info.value = [
      { key: "UIGF版本", value: res.data.info.uigf_version },
      { key: "UID", value: res.data.info.uid },
      { key: "导出应用", value: `${res.data.info.export_app}` },
      { key: "导出应用版本", value: `${res.data.info.export_app_version}` },
      { key: "导出时间", value: formatTimestamp(res.data.info.export_timestamp, res.data.info.uid) },
    ];
    const lang = langDict[res.data.info.lang ?? "zh-cn"];
    await refreshItemIdDict(lang);
    if (!itemIdDict.value) {
      Message.error("获取物品 ID 字典失败");
      return;
    }
    newData.value = upgradeTool.uigf2o(res.data, itemIdDict.value);
    return;
  }
}

function changeFile(e: Array<unknown>): void {
  if (e.length === 0) {
    resMsg.value = { type: "normal", msg: "", title: "" };
    validJson.value = undefined;
    newData.value = undefined;
    oldData.value = "";
    info.value = [];
    return;
  }
}

function uploadFile(option: RequestOption): UploadRequest {
  info.value = [];
  resMsg.value = { type: "normal", msg: "", title: "" };
  validJson.value = undefined;
  newData.value = undefined;
  const file = option.fileItem.file;
  if (!file) {
    option.onError();
    return {};
  }
  if (file.name.split(".").pop() !== "json") {
    Message.warning("Please upload a json file");
    option.onError();
    return {};
  }
  const reader = new FileReader();
  try {
    reader.onload = (e) => (oldData.value = <string>e.target?.result);
    reader.readAsText(file);
    option.onSuccess();
  } catch (e) {
    option.onError();
  }
  return {};
}
</script>
<style lang="scss" scoped>
.app-container {
  position: relative;
  margin: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  width: calc(100% - 32px);
}

.app-title {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;

  &__left {
    display: flex;
    align-items: center;
    column-gap: 8px;

    img {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      border: 1px solid #eeeeee;
    }

    span {
      font-size: 20px;
      font-weight: bold;
    }
  }

  &__right {
    position: relative;
    width: fit-content;
    margin-left: auto;
  }
}

.app-result {
  display: flex;
  flex-direction: column;
  row-gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.box-container {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.info-container {
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.info-item {
  display: flex;
  justify-content: space-between;
  column-gap: 16px;
  padding: 8px 12px;
  border: none;

  &:nth-child(even) {
    background-color: #f5f5f5;
  }

  &:nth-child(odd) {
    background-color: #ffffff;
  }

  span {
    &:first-child {
      font-weight: bold;
    }

    &:last-child {
      flex: 1;
      text-align: right;
    }
  }
}

@media (min-width: 768px) {
  .app-container {
    width: 600px;
    height: calc(100vh - 32px);
    margin: 16px auto;
  }
}
</style>
