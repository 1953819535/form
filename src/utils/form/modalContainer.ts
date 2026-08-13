import { defineComponent, h, type PropType } from "vue";
import { Modal as AModal, ConfigProvider as AConfigProvider } from "antdv-next";
import type { ModalConfig } from "./types";
import { normalizeSlots, processSlotsWithScope } from "./renderHelper";
import { useFormDialog } from "./useFormDialog";
import { antdConfig } from "@/config/antdConfig";

// ──────────────────────────────────────────────────────────────
// Modal 容器组件
// 组合 AModal + RenderForm，管理 open/afterClose/插槽
// ──────────────────────────────────────────────────────────────
const ModalContainer = defineComponent({
  name: "ModalContainer",
  props: {
    formState: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    model: { type: Object as PropType<ModalConfig>, default: () => ({}) },
    fields: { type: [Array, Function] as PropType<any>, required: true },
    rules: { type: [Object, Function] as PropType<any>, default: undefined },
    form: { type: [Object, Function] as PropType<any>, default: undefined },
    onSubmit: { type: Function as PropType<any>, default: undefined },
    onClosed: { type: Function as PropType<() => void>, default: undefined },
  },
  emits: ["resolve", "reject", "close"],
  setup(props, { emit, expose }) {
    const { open, loading, handleSubmit, handleCancel, slotScope, renderForm } =
      useFormDialog(props, emit, expose);

    return () => {
      const { slots: modalSlotsConfig, ...restModelProps } = props.model || {};
      const resolvedModalSlots = normalizeSlots(modalSlotsConfig) || {};
      const processedModalSlots = processSlotsWithScope(
        resolvedModalSlots,
        slotScope.value,
      );

      return h(AConfigProvider, antdConfig, {
        default: () =>
          h(
            AModal,
            {
              ...restModelProps,
              open: open.value,
              confirmLoading: loading.value,
              onOk: handleSubmit,
              onCancel: handleCancel,
              afterClose: () => {
                emit("close");
                props.onClosed?.();
              },
            },
            {
              default: renderForm,
              ...processedModalSlots,
            },
          ),
      });
    };
  },
});

export default ModalContainer;
