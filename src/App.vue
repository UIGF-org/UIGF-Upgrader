<template>
  <div class="app-container">
    <div class="app-title">
      <img src="/logo.png" alt="logo" />
      <span>UIGF Upgrader</span>
    </div>
    <div class="app-actions">
      <a-upload :show-file-list="false" :custom-request="uploadFile" accept=".json"></a-upload>
      <a-download :data="newData" :filename="`UIGF-Upgrader-${currTs()}.json`">
        <a-button id="downloadBtn" type="primary">下载</a-button>
      </a-download>
    </div>
    <div class="uigf-body">
      <div class="uigf-instance">
        <div class="data-title">Old Data</div>
          <textarea class="json-box" :value="JSON.stringify(oldJson)" v-if="oldJson" />
          <textarea class="json-box" :value="oldData" v-else />
      </div>
      <div class="uigf-instance">
        <div class="data-title">New Data</div>
          <textarea class="json-box" :value="JSON.stringify(newData,null,2)" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, shallowRef, watch } from "vue";
import { Message, RequestOption, UploadRequest } from "@arco-design/web-vue";
import "vue-json-pretty/lib/styles.css";
import aDownload from "@comp/a-download.vue";
import parseJson, { JsonParseType } from "@utils/parseJson.ts";
import upgradeTool from "@utils/upgrade.ts";

const currTs = () => new Date().getTime();

const serverTimezoneOffset = ref<number>();
const serverTimezoneOffsetModel = ref<string>("");
const oldData = ref<string>("");
const oldJson = shallowRef<Record<string, unknown>>();
const newData = shallowRef<UIGF4.Schema>();
const itemIdDict = shallowRef<Record<string, number>>();

watch(serverTimezoneOffset, (val) => {
  if (val) serverTimezoneOffsetModel.value = val.toString();
});

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

async function tryParseJson(data: string): Promise<void> {
  const res = parseJson(data);
  if (res.type === JsonParseType.Error) {
    Message.error(res.data);
    return;
  }
  oldJson.value = JSON.parse(data);
  if (res.type === JsonParseType.Invalid) {
    Message.error("无效的 JSON 文件");
    return;
  }
  if (res.type === JsonParseType.Unknown) {
    Message.warning(res.data);
    return;
  }
  if (res.type === JsonParseType.Uigf4) {
    Message.info("当前文件已是 UIGF4 格式");
    return;
  }
  let updateRes: UIGF4.Schema;
  if (res.type === JsonParseType.Uigf22) {
    // todo 未指定语言时，让用户选择语言
    const lang = langDict[res.data.info.lang ?? "zh-cn"];
    await refreshItemIdDict(lang);
    if (!itemIdDict.value) {
      Message.error("获取物品 ID 字典失败");
      return;
    }
    updateRes = upgradeTool.uigf2o(res.data, itemIdDict.value);
  }
  switch (res.type) {
    case JsonParseType.Srgf:
      updateRes = upgradeTool.srgf(res.data);
      break;
    case JsonParseType.Uigf23:
    case JsonParseType.Uigf24:
      updateRes = upgradeTool.uigf2(res.data);
      break;
    case JsonParseType.Uigf3:
      updateRes = upgradeTool.uigf3(res.data);
      break;
    default:
      return;
  }
  newData.value = updateRes;
}

function uploadFile(option: RequestOption): UploadRequest {
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
    reader.onload = (e) => {
      oldData.value = e.target?.result as string;
      tryParseJson(oldData.value);
    };
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
  align-items: flex-start;
  justify-content: center;
  gap: 16px;
}

.app-title {
  display: flex;
  align-items: center;
  justify-content: flex-start;
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

.app-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}

.uigf-body {
  position: relative;
  display: flex;
  width: 100%;
  justify-content: space-between;
  gap: 12px;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .uigf-body {
    flex-direction: column;
  }

  .uigf-body > .uigf-instance {
    width: 100%;
  }
}

.uigf-instance {
  width: 100%;
  display: flex;
  height: calc(100vh - 160px);
  flex-direction: column;
}

.parsed-data-container {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
}

.parsed-data {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.data-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  column-gap: 10px;
}

.json-box {
  width: 100%;
  height: 100%;
  display: flex;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow-y: auto;
  box-sizing: border-box;
}
</style>
