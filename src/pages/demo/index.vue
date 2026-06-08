<script setup lang="ts">
definePage({
  meta: {
    title: "示例导航",
    requiresAuth: true,
    order: 30, // 排序权重，越小越靠前
  },
  redirect: "/demo/filter-form", // 重定向到第一个子页面
});
</script>

<template>
  <!-- 纯元数据声明，无实际渲染内容 -->
</template>