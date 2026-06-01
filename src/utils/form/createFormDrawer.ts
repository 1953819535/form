import { reactive } from "vue";
import type { CreateFormDrawerConfig, FormDialogReturn } from "./types";
import { mountFormDialog } from "./mountHelper";
import DrawerContainer from "./drawerContainer";

// ──────────────────────────────────────────────────────────────
// createFormDrawer — 命令式创建 Drawer 表单抽屉
// ──────────────────────────────────────────────────────────────
export const createFormDrawer = <
  T extends Record<string, any> = Record<string, any>,
>(
  config: CreateFormDrawerConfig<T>,
): FormDialogReturn<T> => {
  const { drawer, ...formConfig } = config;

  const formState = reactive<Record<string, any>>({
    ...(config.initialValues || {}),
  }) as T;

  return mountFormDialog<T>(
    DrawerContainer,
    {
      drawer: drawer || {},
      fields: formConfig.fields,
      rules: formConfig.rules,
      form: formConfig.form,
      onSubmit: formConfig.onSubmit,
    },
    formState,
  );
};