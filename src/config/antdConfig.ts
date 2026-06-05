import zhCN from "antdv-next/locale/zh_CN";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

// 设置 dayjs 中文语言
dayjs.locale("zh-cn");

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
