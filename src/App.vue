<script setup>
import { antdConfig } from "@/config/antdConfig";
import Test from "./Test.vue";
</script>
<template>
  <a-config-provider v-bind="antdConfig">
    <Test />
  </a-config-provider>
</template>
