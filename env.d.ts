/// <reference types="vite/client" />
/// <reference types="@vue/babel-plugin-jsx/dist/types" />
/// <reference types="vue-router/auto" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
