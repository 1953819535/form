import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes"; // 自动生成的路由表
import { setupLayouts } from "virtual:generated-layouts"; // 👈 导入布局包裹函数

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // 核心：使用 setupLayouts 处理生成的路由表
  routes: setupLayouts(routes),
});

export default router;
