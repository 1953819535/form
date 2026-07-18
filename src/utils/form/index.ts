// ──────────────────────────────────────────────────────────────
// 统一导出
// ──────────────────────────────────────────────────────────────

// 类型
export type {
  SlotRender,
  ComponentLike,
  ModalConfig,
  DrawerConfig,
  FormConfig,
  FormItemConfigExt,
  ComponentConfig,
  FormField,
  DynamicConfig,
  CreateFormModalConfig,
  CreateFormDrawerConfig,
  FormDialogReturn,
  SlotScope,
} from "./types";

// 入口函数
export { createFormModal } from "./createFormModal";
export { createFormDrawer } from "./createFormDrawer";

// 共享 composable（供自定义容器扩展使用）
export { useFormDialog } from "./useFormDialog";
export type { FormDialogProps } from "./useFormDialog";

// ──────────────────────────────────────────────────────────────
// 工具函数
// ──────────────────────────────────────────────────────────────

/**
 * 解析行 Key
 * @param record 行数据
 * @param rowKey 字段名或函数
 */
export function resolveRowKey<T extends Record<string, any>>(
  record: T,
  rowKey: string | ((record: T) => string),
): string | number {
  return typeof rowKey === "function" ? rowKey(record) : record[rowKey];
}
