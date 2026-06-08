<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import SidebarItem from "./SidebarItem.vue";

const route = useRoute();
const router = useRouter();

interface MenuItem {
  key: string;
  title: string;
  order?: number;
  redirect?: string;
  children?: MenuItem[];
}

const menuTree = computed(() => {
  const routes = router.getRoutes();

  const allRoutes = routes.filter(
    (r) => r.meta?.title && !r.path.includes(":") && !r.path.includes("*"),
  );

  // 1. 扁平去重
  const uniqueRouteMap = new Map<string, any>();
  allRoutes.forEach((r) => {
    const existing = uniqueRouteMap.get(r.path);
    if (!existing || (r.redirect && !existing.redirect)) {
      uniqueRouteMap.set(r.path, r);
    }
  });
  const validRoutes = Array.from(uniqueRouteMap.values());

  // 2. 映射初始化
  const map = new Map<string, MenuItem>();
  validRoutes.forEach((r) => {
    map.set(r.path, {
      key: r.path,
      title: r.meta.title as string,
      order: (r.meta.order as number) ?? 100,
      redirect: r.redirect as string | undefined,
      children: [],
    });
  });

  const tree: MenuItem[] = [];

  // 3. 构建多级关系
  validRoutes.forEach((r) => {
    const item = map.get(r.path)!;
    const segments = r.path.split("/").filter(Boolean);

    if (segments.length > 1) {
      let foundParent = false;
      for (let i = segments.length - 1; i > 0; i--) {
        const parentPath = "/" + segments.slice(0, i).join("/");
        if (map.has(parentPath)) {
          const parent = map.get(parentPath)!;
          if (!parent.children) parent.children = [];
          if (!parent.children.some((child) => child.key === item.key)) {
            parent.children.push(item);
          }
          foundParent = true;
          break;
        }
      }
      if (!foundParent) tree.push(item);
    } else {
      tree.push(item);
    }
  });

  // 4. 层级排序并清理空节点
  const sortAndClean = (nodes: MenuItem[]) => {
    nodes.sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortAndClean(node.children);
      } else {
        delete node.children;
      }
    });
  };

  sortAndClean(tree);
  return tree;
});

const expandedGroups = ref<string[]>([]);

const handleGroupToggle = (item: MenuItem) => {
  const index = expandedGroups.value.indexOf(item.key);
  if (index > -1) {
    expandedGroups.value.splice(index, 1);
  } else {
    expandedGroups.value.push(item.key);
  }

  if (!route.path.startsWith(item.key + "/") && route.path !== item.key) {
    router.push(item.key);
  }
};

watch(
  () => route.path,
  (currentPath) => {
    const segments = currentPath.split("/").filter(Boolean);
    for (let i = 1; i < segments.length; i++) {
      const parentPath = "/" + segments.slice(0, i).join("/");
      if (!expandedGroups.value.includes(parentPath)) {
        expandedGroups.value.push(parentPath);
      }
    }
  },
  { immediate: true },
);
</script>

<template>
  <aside
    class="w-56 h-screen bg-white border-r border-slate-200 flex flex-col select-none"
  >
    <!-- 极简功能导航区 -->
    <nav class="flex-1 overflow-y-auto p-2">
      <ul class="space-y-1 list-none m-0 p-0">
        <SidebarItem
          v-for="item in menuTree"
          :key="item.key"
          :item="item"
          :expanded-groups="expandedGroups"
          @toggle-group="handleGroupToggle"
        />
      </ul>
    </nav>
  </aside>
</template>
