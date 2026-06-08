<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Sidebar from "@/components/Sidebar.vue";

// 控制下拉菜单
const isDropdownOpen = ref(false);
const toggleDropdown = (e: Event) => {
  e.stopPropagation();
  isDropdownOpen.value = !isDropdownOpen.value;
};
const closeDropdown = () => {
  isDropdownOpen.value = false;
};

onMounted(() => {
  window.addEventListener("click", closeDropdown);
});
onUnmounted(() => {
  window.removeEventListener("click", closeDropdown);
});

const handleLogout = () => {
  console.log("退出登录");
};
</script>

<template>
  <div class="flex flex-col h-screen">
    <!-- 顶部导航栏 -->
    <header class="flex justify-between items-center px-6 h-16 bg-[#001529]">
      <div class="text-white text-lg font-bold">createForm</div>
      <div class="relative" @click="toggleDropdown">
        <div
          class="w-8 h-8 rounded-full bg-[#1890ff] text-white flex items-center justify-center cursor-pointer"
        >
          U
        </div>
        <div
          v-show="isDropdownOpen"
          class="absolute top-10 right-0 bg-white rounded shadow-md py-2 min-w-[100px]"
        >
          <button
            class="block w-full px-4 py-2 text-left bg-transparent border-none cursor-pointer hover:bg-gray-100"
            @click="handleLogout"
          >
            退出登录
          </button>
        </div>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- 侧边栏 -->
      <Sidebar />

      <!-- 内容区域 -->
      <main class="flex-1 p-6 bg-[#f0f2f5] overflow-y-auto">
        <router-view v-slot="{ Component, route }">
          <transition name="slide" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
