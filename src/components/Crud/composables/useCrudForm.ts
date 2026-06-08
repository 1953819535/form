import { message } from "antdv-next";
import { createFormModal, createFormDrawer, resolveRowKey } from "@/utils/form";
import type {
  FormFieldsContext,
  CrudFormConfig,
  CrudErrorConfig,
} from "../types";

/**
 * 表单弹窗相关逻辑
 */
export function useCrudForm<T extends Record<string, any>>(
  formConfig: CrudFormConfig<T> | undefined,
  rowKey: string | ((record: T) => string),
  api: {
    create?: (data: Partial<T>) => Promise<void>;
    update?: (id: any, data: Partial<T>) => Promise<void>;
  },
  errorConfig?: CrudErrorConfig,
  callbacks?: {
    onCreateSuccess?: (data: T) => void;
    onUpdateSuccess?: (data: T) => void;
  },
  refresh?: () => Promise<void>,
) {
  const {
    fields: formFields,
    type: formType = "modal",
    props: formProps,
    rules: formRules,
    transform: formTransform,
  } = formConfig || {};

  // 解析表单字段
  const resolveFields = (mode: "add" | "edit", formData: T) => {
    if (!formFields) return [];
    const context: FormFieldsContext<T> = { mode, formData };
    return typeof formFields === "function" ? formFields(context) : formFields;
  };

  // 打开表单
  const openForm = (mode: "add" | "edit", record?: T) => {
    if (!formFields) return;

    const formData = record ?? ({} as T);
    const fields = resolveFields(mode, formData);
    const rowKeyValue =
      mode === "edit" && record
        ? resolveRowKey(record, rowKey ?? "id")
        : undefined;

    const onSubmit = async (data: T) => {
      // 表单数据转换
      let submitData = data;
      if (formTransform) {
        submitData = formTransform(data, mode) as T;
      }

      try {
        if (mode === "add") {
          await api.create?.(submitData);
          if (errorConfig?.show) {
            message.success("新增成功");
          }
          callbacks?.onCreateSuccess?.(data);
        } else {
          await api.update?.(rowKeyValue, submitData);
          if (errorConfig?.show) {
            message.success("更新成功");
          }
          callbacks?.onUpdateSuccess?.(data);
        }
        refresh?.();
      } catch (error) {
        errorConfig?.handler?.(
          error as Error,
          mode === "add" ? "create" : "update",
        );
        throw error;
      }
    };

    const dialogConfig = {
      title: mode === "add" ? "新增" : "编辑",
      ...(formProps || {}),
    };

    const commonConfig = {
      fields,
      rules: formRules as any,
      onSubmit,
      ...(mode === "edit" && record ? { initialValues: record } : {}),
    };

    if (formType === "drawer") {
      createFormDrawer<T>({
        drawer: dialogConfig,
        ...commonConfig,
      });
    } else {
      createFormModal<T>({
        model: dialogConfig,
        ...commonConfig,
      });
    }
  };

  return {
    openAddForm: () => openForm("add"),
    openEditForm: (record: T) => openForm("edit", record),
  };
}
