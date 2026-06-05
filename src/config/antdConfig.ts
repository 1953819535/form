import zhCN from "antdv-next/locale/zh_CN";

// ──────────────────────────────────────────────────────────────
// Ant Design Vue 全局配置
// 主应用和弹窗组件共享此配置
// ──────────────────────────────────────────────────────────────
export const antdConfig = {
  locale: zhCN,
  // 其他可配置项：
  // direction: 'ltr' | 'rtl',
  // prefixCls: 'ant',
  // theme: { ... },
};

// 类型导出，方便类型推断
export type AntdConfig = typeof antdConfig;
