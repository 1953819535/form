import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题 - 用于侧边栏显示 */
    title?: string;
    /** 是否需要登录 */
    requiresAuth?: boolean;
    /** 排序权重，越小越靠前 */
    order?: number;
    /** 布局名称 */
    layout?: 'default' | 'blank';
    /** 是否在侧边栏隐藏 - 设为 true 时该路由不会出现在侧边栏菜单中 */
    hideMenu?: boolean;
    /** 重定向路径 */
    redirect?: string;
  }
}
