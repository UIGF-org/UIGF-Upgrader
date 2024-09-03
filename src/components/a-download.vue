<template>
  <a :href="downloadUrl" :download="filename">
    <slot></slot>
  </a>
</template>

<script>
export default {
  props: {
    data: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    }
  },
  computed: {
    downloadUrl() {
      return 'data:text/json;charset=utf-8,' + encodeURIComponent(this.data);
    }
  }
};
</script>
