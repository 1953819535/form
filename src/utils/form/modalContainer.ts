import { defineComponent, h, ref, computed, type PropType } from "vue";
import { Modal as AModal, ConfigProvider as AConfigProvider } from "antdv-next";
import type { ModalConfig } from "./types";
import { normalizeSlots, processSlotsWithScope } from "./renderHelper";
import RenderForm from "./renderForm";
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
  },
  emits: ["resolve", "reject", "close"],
  setup(props, { emit, expose }) {
    const open = ref(true);

    expose({
      setOpen: (val: boolean) => {
        open.value = val;
      },
      validate: () => renderFormRef.value?.formRef?.validate(),
    });
    const renderFormRef = ref<any>();
    const loading = ref(false);

    const handleSubmit = async () => {
      loading.value = true;
      try {
        await renderFormRef.value?.handleSubmit();
      } finally {
        loading.value = false;
      }
    };

    const handleCancel = () => {
      open.value = false;
    };

    const handleAfterClose = () => {
      emit("close");
    };

    // slotScope：注入到 Modal 非 default 插槽中
    const slotScope = computed(() => ({
      formData: props.formState,
      submit: handleSubmit,
      cancel: handleCancel,
      loading: loading.value,
    }));

    return () => {
      const { slots: modalSlotsConfig, ...restModelProps } = props.model || {};
      const resolvedModalSlots = normalizeSlots(modalSlotsConfig) || {};

      // 处理 Modal 插槽：注入 slotScope
      const processedModalSlots = processSlotsWithScope(resolvedModalSlots, slotScope.value);

      return h(
        AConfigProvider,
        antdConfig,
        {
          default: () =>
            h(
              AModal,
              {
                ...restModelProps,
                open: open.value,
                confirmLoading: loading.value,
                onOk: handleSubmit,
                onCancel: handleCancel,
                afterClose: handleAfterClose,
              },
              {
                default: () =>
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
                  }),
                ...processedModalSlots,
              },
            ),
        },
      );
    };
  },
});

export default ModalContainer;
