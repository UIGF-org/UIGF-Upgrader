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
        <div class="data-title">Old UIGF Data</div>
        <div class="parsed-data-container">
          <div class="parsed-data">
            <div class="data-title">UIGF 版本</div>
            <a-textarea class="parsed-data-box" v-model="uigfVersion" readonly auto-size />
          </div>
          <div class="parsed-data">
            <div class="data-title">导出 App</div>
            <a-textarea class="parsed-data-box" v-model="exportApp" readonly auto-size />
          </div>
          <div class="parsed-data">
            <div class="data-title">导出时间</div>
            <a-textarea class="parsed-data-box" v-model="exportTime" readonly auto-size />
          </div>
        </div>
        <div class="parsed-data-container">
          <div class="parsed-data">
            <div class="data-title">UID</div>
            <a-textarea class="parsed-data-box" v-model="uid" readonly auto-size />
          </div>
          <div class="parsed-data">
            <div class="data-title">导出语言</div>
            <a-textarea class="parsed-data-box" v-model="exportLanguage" readonly auto-size />
          </div>
          <div class="parsed-data">
            <div class="data-title">服务器时区偏移</div>
            <a-textarea class="parsed-data-box" v-model="serverTimezoneOffsetModel" readonly auto-size />
          </div>
        </div>
        <a-textarea class="old-uigf-data-box" v-model="oldData" readonly auto-size />
      </div>
      <div class="uigf-instance">
        <div class="data-title">
          <span>New UIGF Data</span>
        </div>
        <a-textarea class="uigf-data-box" v-model="newData" readonly auto-size />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";
import { RequestOption, UploadRequest } from "@arco-design/web-vue";
// @ts-ignore
import aDownload from './components/a-download.vue';

const currTs = () => new Date().getTime();

const uigfVersion = ref<string>("");
const exportApp = ref<string>("");
const exportTime = ref<string>("");
const uid = ref<string>("");
const exportLanguage = ref<string>("");
const serverTimezoneOffset = ref<number>();
const serverTimezoneOffsetModel = ref<string>("");
const oldData = ref<string>("");
const newData = ref<string>("");

watch(serverTimezoneOffset, (val) => {
  serverTimezoneOffsetModel.value = val.toString();
});

const itemIdDict = ref<{ [key: string]: number }>({});

const langDict: { [key: string]: string } = {
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
}

function refreshItemIdDict(lang: string) {
  const dictUrl = `https://api.uigf.org/dict/genshin/${lang}.json`
  fetch(dictUrl)
    .then(res => res.json())
    .then(data => {
      itemIdDict.value = data;
    })
    .catch(err => {
      console.error(err);
    });
}

function parseOldData() {
  const data = JSON.parse(oldData.value);
  try {
    if (data.info.version) {
      uigfVersion.value = data.info.version;
      parseUIGF4(data);
      return;
    }

    if (data.info.uigf_version) {
      uigfVersion.value = data.info.uigf_version;
      parseUIGF2or3(data);
      return;
    }

    if (data.info.srgf_version) {
      alert("暂不支持 SRGF 文件");
      return;
    }

    alert('无效 UIGF 文件');
  }
  catch (e) {
    console.error(e);
  }
}

function parseUIGF2or3(data: any) {
  exportApp.value = `${data.info.export_app} ${data.info.export_app_version}`;
  exportTime.value = data.info.export_time;
  uid.value = data.info.uid;
  exportLanguage.value = data.info.lang;

  if (data.info.region_time_zone) {
    serverTimezoneOffset.value = data.info.region_time_zone;
  } else {
    const currentUid = data.info.uid;

    switch (currentUid[currentUid.length - 9])
    {
      case "6":
        serverTimezoneOffset.value = -5;
        break;
      case "7":
        serverTimezoneOffset.value = 1;
        break;
      default:
        serverTimezoneOffset.value = 8;
        break;
    }
  }

  const lang = langDict[data.info.lang];
  if (lang) {
    refreshItemIdDict(lang);
  }

  newData.value = JSON.stringify({
    info: {
      version: "v4.0",
      export_app: "UIGF Upgrader",
      export_app_version: "0.1.0",
      export_timestamp: Math.floor(new Date().getTime() / 1000),
    },
    hk4e: [
      {
        uid: uid.value,
        timezone: serverTimezoneOffset.value,
        list: upgradeUIGFItems(data.list)
      }
    ],
  }, null, 2);
}

function upgradeUIGFItems(oldItems: any[]) {
  const newItems: any[] = [];
  oldItems.forEach(item => {
    const newItem = {
      uigf_gacha_type: item.uigf_gacha_type,
      gacha_type: item.gacha_type,
      time: item.time,
      id: item.id,
    }

    if (item.item_id) {
    // @ts-ignore
      newItem.item_id = item.item_id;
    } else {
      // @ts-ignore
      newItem.item_id = itemIdDict.value[item.name];
    }

    newItems.push(newItem);
  });

  return newItems;
}

function parseUIGF4(data: any) {
  exportApp.value = `${data.info.export_app} ${data.info.export_app_version}`;
  exportTime.value = new Date(data.info.export_timestamp * 1000).toLocaleString();

  newData.value = "无需升级，当前文件已是 UIGF4 格式";
}

function uploadFile(option: RequestOption): UploadRequest {
  const file = option.fileItem.file;
  if (!file) {
    option.onError();
    return {};
  }
  if (file.name.split('.').pop() !== 'json') {
    alert('Please upload a json file');
    option.onError();
    return {};
  }
  const reader = new FileReader();
  try {
    reader.onload = (e) => {
      oldData.value = e.target?.result as string;
      parseOldData();
    };
    reader.readAsText(file);
    option.onSuccess();
  } catch (e) {
    option.onError();
  }
  return {};
}
</script>


<style lang="css" scoped>
.app-container {
  position: relative;
  margin: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 20px;
}

.app-title {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  column-gap: 10px;
  flex-wrap: wrap;
}

.app-title img {
  width: 40px;
  height: 40px;
}

.app-title span {
  font-size: 20px;
  font-weight: bold;
}

.app-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  gap: 10px;
}

.uigf-body {
  position: relative;
  display: flex;
  width: 100%;
  justify-content: space-between;
}

@media (max-width: 768px) {
  .uigf-body {
    flex-direction: column;
  }

  .uigf-body>.uigf-instance {
    width: 100%;
  }
}

.uigf-instance {
  width: 49%;
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

.old-uigf-data-box {
  width: 100%;
  display: flex;
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow-y: auto;
}

.uigf-data-box {
  width: 100%;
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow-y: auto;
}

.parsed-data-box {
  width: auto;
  padding: 5px;
  margin-bottom: 10px;
}
</style>
