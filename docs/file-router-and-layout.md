# 文件路由与布局系统设计文档

## 一、核心设计理念

**"物理目录即路由，组件声明即配置，算法装配即树状"**

本系统采用 Vue Router 5.x 的文件路由模式，结合 `vite-plugin-vue-layouts` 实现自动化的路由与布局管理。

---

## 二、文件路由系统

### 2.1 基本原理

文件路由将磁盘上的文件夹层级，自动映射为 URL 路径中的层级结构。

```
物理目录结构                      自动生成的 URL 路径
src/pages/
├── index.vue                 →  /              (根路由，重定向到 /home)
├── home.vue                  →  /home          (首页)
└── demo/                     →  /demo          (示例导航目录)
    ├── index.vue             →  /demo          (目录入口，声明元数据 + 重定向)
    ├── filter-form.vue       →  /demo/filter-form
    ├── modal-form.vue        →  /demo/modal-form
    ├── drawer-form.vue       →  /demo/drawer-form
    └── crud.vue              →  /demo/crud
```

### 2.2 definePage 配置项

在每个页面组件中使用 `definePage()` 声明路由配置：

```vue
<script setup lang="ts">
definePage({
  meta: {
    title: "示例导航",        // 菜单显示标题
    requiresAuth: true,       // 权限控制
    order: 30,                // 排序权重（越小越靠前）
  },
  redirect: "/demo/filter-form", // 重定向目标
});
</script>
```

**支持的关键配置：**

| 配置项 | 说明 |
|--------|------|
| `meta.title` | 菜单显示名称，必填才能出现在菜单中 |
| `meta.order` | 排序权重，默认 100 |
| `meta.requiresAuth` | 是否需要登录权限 |
| `redirect` | 重定向目标路径 |

### 2.3 目录 index.vue 的特殊处理

目录下的 `index.vue` 文件有两种用途：

#### 类型 A：纯分组节点（有 redirect）

```vue
<script setup lang="ts">
definePage({
  meta: {
    title: "示例导航",
    order: 30,
  },
  redirect: "/demo/filter-form",
});
</script>

<template>
  <!-- 纯元数据声明，无实际渲染内容 -->
</template>
```

**特点：**
- 不渲染实际页面内容
- 作为菜单树的分组节点
- 用户直接访问 `/demo` URL 时，自动重定向到第一个子页面

#### 类型 B：叶子节点（无 redirect）

```vue
<script setup lang="ts">
definePage({
  meta: {
    title: "用户列表",
    order: 20,
  },
});
</script>

<template>
  <div>用户列表内容</div>
</template>
```

**特点：**
- 渲染实际页面内容
- 作为菜单树的叶子节点
- 点击直接跳转

### 2.4 路由类型识别

通过路由名称判断是否为 `index.vue`：

```typescript
// index.vue 生成的路由名带有尾部斜杠
// 例如：/demo/ → 来自 demo/index.vue
if (r.name && String(r.name).endsWith("/")) {
  // 这是一个目录的 index.vue
}
```

---

## 三、布局系统

### 3.1 布局组件

布局组件位于 `src/layouts/` 目录：

| 布局文件 | 用途 |
|----------|------|
| `default.vue` | 默认布局，包含顶部导航栏 + 侧边栏 + 内容区 |
| `blank.vue` | 空白布局，仅渲染页面内容 |

### 3.2 布局自动包裹

`vite-plugin-vue-layouts` 自动将每个路由包裹在布局组件中：

```typescript
// router.ts
import { routes } from "vue-router/auto-routes";
import { setupLayouts } from "virtual:generated-layouts";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes), // 自动包裹布局
});
```

### 3.3 默认布局结构

```
┌─────────────────────────────────────────────────────┐
│  顶部导航栏 (Header)                                │
│  ┌─────────────────────────────────────────────────┐│
│  │ createForm              [用户头像下拉菜单]       ││
│  └─────────────────────────────────────────────────┘│
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│  侧边栏      │         内容区 (Main)                │
│  (Sidebar)   │                                      │
│              │         <router-view />              │
│  ┌────────┐  │                                      │
│  │ 菜单树 │  │                                      │
│  │        │  │                                      │
│  └────────┘  │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

---

## 四、侧边栏菜单树构建

### 4.1 核心算法

从扁平路由数组构建树状菜单结构：

```typescript
const menuTree = computed(() => {
  const routes = router.getRoutes();

  // 1. 过滤有效路由：有 title 且不是动态路由
  const validRoutes = routes.filter(
    (r) => r.meta?.title && !r.path.includes(":") && !r.path.includes("*"),
  );

  // 2. 扁平去重（解决布局插件导致的重复）
  const uniqueRouteMap = new Map<string, any>();
  allRoutes.forEach((r) => {
    const existing = uniqueRouteMap.get(r.path);
    if (!existing || (r.redirect && !existing.redirect)) {
      uniqueRouteMap.set(r.path, r);
    }
  });

  // 3. 构建多级关系：向上追溯最近的已注册父路径
  validRoutes.forEach((r) => {
    const segments = r.path.split("/").filter(Boolean);
    if (segments.length > 1) {
      // 向上寻找父级
      for (let i = segments.length - 1; i > 0; i--) {
        const parentPath = "/" + segments.slice(0, i).join("/");
        if (map.has(parentPath)) {
          map.get(parentPath)!.children.push(item);
          break; // 找到最近的父级即可
        }
      }
    }
  });

  // 4. 递归排序并清理空节点
  const sortAndClean = (nodes: MenuItem[]) => {
    nodes.sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
    nodes.forEach((node) => {
      if (node.children?.length > 0) {
        sortAndClean(node.children);
      } else {
        delete node.children;
      }
    });
  };

  return tree;
});
```

### 4.2 转换流程图

```
[扁平路由数组]
      │
      ▼
┌──────────────────┐
│ 1. 过滤有效路由  │ → 排除无 title、动态参数、通配符路由
└─────────┬────────┘
          ▼
┌──────────────────┐
│ 2. 扁平去重      │ → 解决布局插件导致的重复路由
└─────────┬────────┘
          ▼
┌──────────────────┐
│ 3. 建立检索字典  │ → Map<path, MenuItem>
└─────────┬────────┘
          ▼
┌──────────────────┐
│ 4. 向上追溯父级  │ → 将子路由挂载到最近的已注册父路径
└─────────┬────────┘
          ▼
┌──────────────────┐
│ 5. 递归排序清理  │ → 按 order 排序，清理空 children
└─────────┬────────┘
          ▼
[多维树状菜单结构]
```

---

## 五、递归菜单组件

### 5.1 组件结构

```
Sidebar.vue (容器组件)
    │
    └── SidebarItem.vue (递归组件)
            │
            └── SidebarItem.vue (自引用，支持无限深度)
```

### 5.2 SidebarItem 渲染逻辑

对每个菜单节点进行二选一分流：

```vue
<template>
  <!-- 情况 A：分组节点（有 redirect 或有 children） -->
  <li v-if="item.redirect || (item.children && item.children.length > 0)">
    <div @click="emit('toggle-group', item)">
      <span>{{ item.title }}</span>
      <!-- 箭头图标（仅在有 children 时显示） -->
      <svg v-if="item.children && item.children.length > 0">
        ...
      </svg>
    </div>
    <!-- 递归渲染子菜单 -->
    <ul v-show="isExpanded(item.key)">
      <SidebarItem
        v-for="child in item.children"
        :item="child"
        @toggle-group="emit('toggle-group', $event)"
      />
    </ul>
  </li>

  <!-- 情况 B：叶子节点 -->
  <li v-else @click="router.push(item.key)">
    {{ item.title }}
  </li>
</template>
```

### 5.3 交互行为

| 操作 | 行为 |
|------|------|
| 点击分组标题 | 展开/收起子菜单 |
| 点击叶子节点 | 路由跳转到对应路径 |
| 直接访问 `/demo` URL | 自动重定向到 `/demo/filter-form` |

**注意：** 点击分组时**不触发跳转**，redirect 仅用于 URL 直接访问场景。

### 5.4 自动展开祖先

路由切换时，自动展开当前路由的所有上级分组：

```typescript
watch(
  () => route.path,
  (currentPath) => {
    const segments = currentPath.split("/").filter(Boolean);
    // 逐级提取祖先路径并展开
    for (let i = 1; i < segments.length; i++) {
      const parentPath = "/" + segments.slice(0, i).join("/");
      expandedGroups.value.push(parentPath);
    }
  },
  { immediate: true },
);
```

例如：访问 `/demo/modal-form` 时，自动展开 `/demo` 分组。

---

## 六、文件忽略规则

`vite.config.ts` 配置了文件路由的忽略规则：

```typescript
VueRouter({
  exclude: [
    "**/components/**",       // 忽略 components 目录
    "**/__*",                 // 忽略双下划线开头文件
    "**/__*/**/*",            // 忽略双下划线目录下所有文件
    "**/*.component.vue",     // 忽略 .component.vue 结尾文件
  ],
})
```

**用途：** 页面组件的私有子组件可以放在 `__components/` 目录，不会被注册为路由。

例如：
```
src/pages/user/
├── index.vue              → 注册为路由 /user
└── __components/
    └── user-card.vue      → 不注册为路由（私有组件）
```

---

## 七、最佳实践

### 7.1 目录设计建议

```
src/pages/
├── index.vue              → 根路由，配置 redirect
├── home.vue               → 首页
├── system/                → 系统管理模块
│   ├── index.vue          → 分组节点（redirect 到第一个子页面）
│   ├── users.vue          → 用户管理
│   └── roles.vue          → 角色管理
└── demo/                  → 示例模块
    ├── index.vue          → 分组节点
    └── __components/      → 私有组件（不生成路由）
        └── shared-form.vue
```

### 7.2 元数据配置建议

```typescript
definePage({
  meta: {
    title: "用户管理",       // 必填，用于菜单显示
    order: 20,              // 建议填写，控制排序
    requiresAuth: true,     // 按需配置
  },
});
```

### 7.3 重定向配置建议

目录的 `index.vue` 应重定向到第一个子页面：

```typescript
definePage({
  redirect: "/system/users", // 第一个子页面路径
});
```

这样用户直接访问 `/system` 时，会自动跳转到有内容 `/system/users`。

---

## 八、相关文件

| 文件路径 | 作用 |
|----------|------|
| `src/router.ts` | 路由入口，整合 auto-routes 和 layouts |
| `src/layouts/default.vue` | 默认布局组件 |
| `src/layouts/blank.vue` | 空白布局组件 |
| `src/components/Sidebar.vue` | 侧边栏容器，菜单树构建逻辑 |
| `src/components/SidebarItem.vue` | 递归菜单项组件 |
| `vite.config.ts` | Vite 配置，包含 VueRouter 和 Layouts 插件 |
| `typed-router.d.ts` | 自动生成的路由类型定义 |