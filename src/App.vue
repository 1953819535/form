<script setup>
import zhCN from "antdv-next/locale/zh_CN";

import Test from "./Test.vue";
</script>
<template>
  <a-config-provider :locale="zhCN">
    <Test />
  </a-config-provider>
</template>
