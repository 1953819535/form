<script setup lang="ts">
definePage({
  meta: {
    title: "用户列表",
    requiresAuth: true,
    order: 20, // 排序权重，越小越靠前
  },
});

import UserCard from "./components/user-card.vue";
</script>

<template>
  <div>
    user list
    <UserCard />
  </div>
</template>
