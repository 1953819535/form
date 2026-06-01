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
