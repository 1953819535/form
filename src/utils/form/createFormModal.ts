import { reactive } from "vue";
import type { CreateFormModalConfig, FormDialogReturn } from "./types";
import { mountFormDialog } from "./mountHelper";
import ModalContainer from "./modalContainer";

// ──────────────────────────────────────────────────────────────
// createFormModal — 命令式创建 Modal 表单弹窗
// ──────────────────────────────────────────────────────────────
export const createFormModal = <
  T extends Record<string, any> = Record<string, any>,
>(
  config: CreateFormModalConfig<T>,
): FormDialogReturn<T> => {
  const { model, ...formConfig } = config;

  const formState = reactive<Record<string, any>>({
    ...(config.initialValues || {}),
  }) as T;

  return mountFormDialog<T>(
    ModalContainer,
    {
      model: model || {},
      fields: formConfig.fields,
      rules: formConfig.rules,
      form: formConfig.form,
      onSubmit: formConfig.onSubmit,
    },
    formState,
  );
};