<script setup lang="ts">
definePage({
  meta: {
    title: "Crud 组件",
    requiresAuth: true,
    order: 4, // 子菜单排序
  },
});

import {
  Demo1Basic,
  Demo2NoPagination,
  Demo3DrawerMultiSelect,
  Demo4CustomError,
  Demo5Transform,
  Demo6TableProps,
  Demo7CustomContent,
} from "@/components/Crud/demos";
</script>

<template>
  <div class="page-container">
    <h2>Crud 组件示例</h2>

    <Demo1Basic />
    <Demo2NoPagination />
    <Demo3DrawerMultiSelect />
    <Demo4CustomError />
    <Demo5Transform />
    <Demo6TableProps />
    <Demo7CustomContent />
  </div>
</template>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 1200px;
}

.page-container h2 {
  margin-bottom: 24px;
}
</style>