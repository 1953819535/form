<script setup>
import { antdConfig } from "@/config/antdConfig";
</script>
<template>
  <a-config-provider v-bind="antdConfig">
    <router-view />
  </a-config-provider>
</template>
<style>
@import "tailwindcss";
</style>
