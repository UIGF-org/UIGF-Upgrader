<template>
  <a :href="downloadUrl" :download="filename">
    <slot></slot>
  </a>
</template>
<script lang="ts" setup>
import { computed } from "vue";

type DownloadProps = { data?: UIGF4.Schema; filename: string };
const props = defineProps<DownloadProps>();
const downloadUrl = computed<string>(() => `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(props.data ?? {}))}`);
</script>
