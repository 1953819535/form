import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import vueDevTools from "vite-plugin-vue-devtools";

import { AntdvNextResolver } from "@antdv-next/auto-import-resolver";
import Components from "unplugin-vue-components/vite";

import VueRouter from "vue-router/vite";
import Layouts from "vite-plugin-vue-layouts"; // 👈 引入布局插件

import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    VueRouter({
      // 排除生成路由的规则（基于 Picomatch 规范）
      exclude: [
        "**/components/**", // 1. 忽略所有名为 components 目录下的组件
        "**/__*", // 2. 忽略所有双下划线 __ 开头的文件（如 __Banner.vue）
        "**/__*/**/*", // 3. 忽略双下划线 __ 开头的目录下的所有子文件
        "**/*.component.vue", // 4. 忽略所有以 .component.vue 结尾的文件
      ],
    }),
    Layouts({
      layoutsDirs: "src/layouts", // 布局组件存放目录
      defaultLayout: "default", // 默认布局（对应 default.vue）
    }),
    vue(),
    vueJsx({
      // 配置 JSX 运行时选项
      transformOn: true,
      mergeProps: true,
    }),
    mode === "development" && vueDevTools(),
    Components({
      resolvers: [AntdvNextResolver()],
    }),
    tailwindcss(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}));
