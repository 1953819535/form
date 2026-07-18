import { h, ref, computed } from "vue";
import type { SlotScope } from "./types";
import RenderForm from "./renderForm";

// ──────────────────────────────────────────────────────────────
// useFormDialog — ModalContainer / DrawerContainer 共享逻辑
//
// 抽取两个容器组件的公共部分：
//   - open / loading 状态
//   - RenderForm ref 与 renderForm 函数
//   - handleSubmit / handleCancel
//   - slotScope computed
//   - expose (setOpen / validate)
//
// 自定义容器也可以复用此 composable，按需组合返回值。
// ──────────────────────────────────────────────────────────────

export interface FormDialogProps {
  formState: Record<string, any>;
  fields: any;
  rules?: any;
  form?: any;
  onSubmit?: any;
}

export function useFormDialog(
  props: FormDialogProps,
  emit: (event: "resolve" | "reject" | "close", ...args: any[]) => void,
  expose: (exposed: Record<string, any>) => void,
) {
  const open = ref(true);
  const renderFormRef = ref<any>();
  const loading = ref(false);

  // ── 暴露给 mountHelper ──
  expose({
    setOpen: (val: boolean) => {
      open.value = val;
    },
    validate: () => renderFormRef.value?.formRef?.validate(),
  });

  // ── 提交 ──
  const handleSubmit = async () => {
    loading.value = true;
    try {
      await renderFormRef.value?.handleSubmit();
    } finally {
      loading.value = false;
    }
  };

  // ── 取消 ──
  const handleCancel = () => {
    open.value = false;
  };

  // ── 插槽作用域（注入到容器的非 default 插槽） ──
  const slotScope = computed<SlotScope<any>>(() => ({
    formData: props.formState,
    submit: handleSubmit,
    cancel: handleCancel,
    loading: loading.value,
  }));

  // ── 共享的 RenderForm 节点 ──
  const renderForm = () =>
    h(RenderForm, {
      ref: renderFormRef,
      formState: props.formState,
      fields: props.fields,
      rules: props.rules,
      form: props.form,
      onSubmit: props.onSubmit,
      onResolve: (data: any) => {
        open.value = false;
        emit("resolve", data);
      },
      onReject: (err: Error) => {
        open.value = false;
        emit("reject", err);
      },
    });

  return {
    open,
    loading,
    handleSubmit,
    handleCancel,
    slotScope,
    renderForm,
  };
}
