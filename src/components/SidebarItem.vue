<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";

interface MenuItem {
  key: string;
  title: string;
  order?: number;
  redirect?: string;
  children?: MenuItem[];
}

const props = defineProps<{
  item: MenuItem;
  expandedGroups: string[];
}>();

const emit = defineEmits<{
  (e: "toggle-group", item: MenuItem): void;
}>();

const router = useRouter();
const route = useRoute();

const isExpanded = (key: string) => props.expandedGroups.includes(key);

const isActive = (key: string) => {
  if (route.path === key) return true;
  return route.path.startsWith(key + "/");
};
</script>

<template>
  <!-- 情况 A：分组节点 -->
  <li v-if="item.redirect || (item.children && item.children.length > 0)">
    <div
      :class="[
        'flex items-center justify-between px-3 py-2 rounded text-sm font-medium cursor-pointer transition-colors',
        isActive(item.key)
          ? 'text-blue-600'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
      ]"
      @click="emit('toggle-group', item)"
    >
      <span>{{ item.title }}</span>
      <svg
        v-if="item.children && item.children.length > 0"
        :class="[
          'w-4 h-4 transition-transform duration-150 text-slate-400',
          isExpanded(item.key) ? 'rotate-180' : '',
        ]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>

    <!-- 子菜单列表 -->
    <transition name="collapse">
      <ul
        v-show="
          isExpanded(item.key) && item.children && item.children.length > 0
        "
        class="pl-4 mt-0.5 space-y-0.5 border-l border-slate-200 ml-4 list-none"
      >
        <SidebarItem
          v-for="child in item.children"
          :key="child.key"
          :item="child"
          :expanded-groups="expandedGroups"
          @toggle-group="emit('toggle-group', $event)"
        />
      </ul>
    </transition>
  </li>

  <!-- 情况 B：叶子节点 -->
  <li v-else>
    <div
      :class="[
        'px-3 py-2 rounded text-sm font-medium cursor-pointer transition-colors',
        route.path === item.key
          ? 'bg-blue-50 text-blue-600'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
      ]"
      @click="router.push(item.key)"
    >
      {{ item.title }}
    </div>
  </li>
</template>

<style scoped>
.collapse-enter-active,
.collapse-leave-active {
  transition:
    max-height 0.2s ease-out,
    opacity 0.15s ease-out;
  max-height: 400px;
  overflow: hidden;
}
.collapse-enter-from,
.collapse-leave-to {
  max-height: 0 !important;
  opacity: 0;
}
</style>
