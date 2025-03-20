<template>
  <div class="app-container">
    <div class="app-title">
      <img src="/logo.png" alt="logo" />
      <span>UIGF Upgrader</span>
    </div>
    <div class="app-result">
      <a-upload draggable accept=".json" :custom-request="uploadFile" :show-file-list="false" />
    </div>
    <div class="box-container">
      <a-alert class="box-alert" v-if="resMsg.title !== ''" :type="resMsg.type">
        <template #title>{{ resMsg.title }}</template>
        <span style="white-space: pre-wrap">{{ resMsg.msg }}</span>
        <template #action>
          <div v-if="newData">
            <a-download v-if="newData" :data="newData" :filename="`UIGF-Upgrader-${curTs}.json`">
              <a-button id="downloadBtn" type="primary">Download</a-button>
            </a-download>
          </div>
        </template>
      </a-alert>
      <textarea :value="validJson" v-if="validJson" />
      <div class="info-container">
        <div class="info-item" v-for="item in info" :key="item.key">
          <span>{{ item.key }}</span>
          <span>{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, shallowRef, watch } from "vue";
import { Message, RequestOption, UploadRequest } from "@arco-design/web-vue";
import ADownload from "@comp/a-download.vue";
import parseJson, { JsonParseType } from "@utils/parseJson.ts";
import upgradeTool from "@utils/upgrade.ts";

type ParseItem = { key: string; value: string };
type ParseInfo = Array<ParseItem>;
type AlertType = "normal" | "error" | "success" | "warning" | "info";
type AlertMsg = { type: AlertType; msg: string; title: string };

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

const oldData = ref<string>("");
const validJson = ref<string>();
const newData = shallowRef<UIGF4.Schema>();
const resMsg = shallowRef<AlertMsg>({ type: "normal", msg: "", title: "" });
const info = shallowRef<ParseInfo>([]);
const itemIdDict = shallowRef<Record<string, number>>();
const curTs = computed<number>(() => Date.now());

watch(
  () => oldData.value,
  async () => {
    if (oldData.value !== "") await loadData(oldData.value);
  },
);

async function refreshItemIdDict(lang: string): Promise<void> {
  const dictUrl = `https://api.uigf.org/dict/genshin/${lang}.json`;
  try {
    const res = await fetch(dictUrl);
    itemIdDict.value = await res.json();
  } catch (err) {
    Message.error(`获取物品 ID 字典失败: ${JSON.stringify(err)}`);
    console.error(err);
  }
}

async function loadData(data: string): Promise<void> {
  const res = parseJson(data);
  if (res.type === JsonParseType.Unknown) {
    resMsg.value = { type: "warning", msg: res.data, title: "Parse Unknown" };
    return;
  }
  if (res.type === JsonParseType.Error) {
    resMsg.value = { type: "error", msg: res.data, title: "Parse Error" };
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
      title: `Invalid JSON: ${res.data[0].instancePath} ${res.data[0].message}`,
    };
    return;
  }
  if (res.type === JsonParseType.Uigf4) {
    resMsg.value = { type: "info", title: "Parse UIGFv4.0", msg: "Don't need to upgrade" };
    info.value = [
      { key: "UIGFVersion", value: res.data.info.version },
      { key: "ExportApp", value: res.data.info.export_app },
      { key: "ExportAppVersion", value: res.data.info.export_app_version },
      { key: "ExportTimeStamp", value: res.data.info.export_timestamp },
    ];
    return;
  }
  if (res.type === JsonParseType.Srgf) {
    resMsg.value = {
      type: "info",
      title: `Parse SRGFv${res.data.info.srgf_version}`,
      msg: "Upgrade to UIGF4",
    };
    info.value = [
      { key: "SRGFVersion", value: res.data.info.srgf_version },
      { key: "UID", value: res.data.info.uid },
      { key: "Lang", value: res.data.info.lang },
      { key: "ExportApp", value: `${res.data.info.export_app}` },
      { key: "ExportAppVersion", value: `${res.data.info.export_app_version}` },
      { key: "ExportTimeStamp", value: `${res.data.info.export_timestamp}` },
    ];
    newData.value = upgradeTool.srgf(res.data);
    return;
  }
  if (res.type === JsonParseType.Uigf3) {
    resMsg.value = { type: "info", title: "Parse UIGFv3.0", msg: "Upgrade to UIGF4" };
    info.value = [
      { key: "UIGFVersion", value: res.data.info.uigf_version },
      { key: "UID", value: res.data.info.uid },
      { key: "ExportApp", value: `${res.data.info.export_app}` },
      { key: "ExportAppVersion", value: `${res.data.info.export_app_version}` },
      { key: "ExportTimeStamp", value: `${res.data.info.export_timestamp}` },
    ];
    newData.value = upgradeTool.uigf3(res.data);
    return;
  }
  if (res.type === JsonParseType.Uigf24 || res.type === JsonParseType.Uigf23) {
    resMsg.value = {
      type: "info",
      title: `Parse UIGF${res.data.info.uigf_version}`,
      msg: "Upgrade to UIGF4",
    };
    info.value = [
      { key: "UIGFVersion", value: res.data.info.uigf_version },
      { key: "UID", value: res.data.info.uid },
      { key: "ExportApp", value: `${res.data.info.export_app}` },
      { key: "ExportAppVersion", value: `${res.data.info.export_app_version}` },
      { key: "ExportTimeStamp", value: `${res.data.info.export_timestamp}` },
    ];
    newData.value = upgradeTool.uigf2(res.data);
    return;
  }
  if (res.type === JsonParseType.Uigf22) {
    resMsg.value = { type: "info", title: "Parse UIGFv2.2", msg: "Upgrade to UIGF4" };
    info.value = [
      { key: "UIGFVersion", value: res.data.info.uigf_version },
      { key: "UID", value: res.data.info.uid },
      { key: "ExportApp", value: `${res.data.info.export_app}` },
      { key: "ExportAppVersion", value: `${res.data.info.export_app_version}` },
      { key: "ExportTimeStamp", value: `${res.data.info.export_timestamp}` },
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
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: auto;
  column-gap: 8px;
  flex-wrap: wrap;

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
  gap: 4px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  column-gap: 16px;

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
