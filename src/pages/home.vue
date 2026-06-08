<script setup lang="ts">
definePage({
  meta: {
    title: "首页",
    requiresAuth: true,
    order: 0, // 排序权重，越小越靠前
    layout: "default",
  },
});
</script>

<template>
  <div class="p-4 bg-blue-500 text-white rounded-lg">
    如果这段文字是蓝色背景白色文字，Tailwind 就正常工作了！
  </div>
</template>
