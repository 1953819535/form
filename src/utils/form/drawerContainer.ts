import { defineComponent, h, ref, computed, type PropType } from "vue";
import { Drawer as ADrawer, Button as AButton, ConfigProvider as AConfigProvider } from "antdv-next";
import type { DrawerConfig, SlotScope } from "./types";
import { normalizeSlots, processSlotsWithScope } from "./renderHelper";
import RenderForm from "./renderForm";
import { antdConfig } from "@/config/antdConfig";

const DefaultFooter = ({ submit, cancel, loading }: SlotScope<any>) =>
  h("div", { style: "display: flex; justify-content: flex-end; gap: 8px" }, [
    h(AButton, { onClick: cancel }, () => "取消"),
    h(AButton, { type: "primary", onClick: submit, loading }, () => "确定"),
  ]);

// ──────────────────────────────────────────────────────────────
// Drawer 容器组件
// 组合 ADrawer + RenderForm，管理 open/afterClose/插槽
// ──────────────────────────────────────────────────────────────
const DrawerContainer = defineComponent({
  name: "DrawerContainer",
  props: {
    formState: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    drawer: { type: Object as PropType<DrawerConfig>, default: () => ({}) },
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

    // slotScope：注入到 Drawer 非 default 插槽中
    const slotScope = computed(() => ({
      formData: props.formState,
      submit: handleSubmit,
      cancel: handleCancel,
      loading: loading.value,
    }));

    return () => {
      const { slots: drawerSlotsConfig, ...restDrawerProps } =
        props.drawer || {};
      const resolvedDrawerSlots = normalizeSlots(drawerSlotsConfig) || {};

      return h(
        AConfigProvider,
        antdConfig,
        {
          default: () =>
            h(
              ADrawer,
              {
                ...restDrawerProps,
                open: open.value,
                onClose: handleCancel,
                afterOpenChange: (isOpen: boolean) => {
                  if (!isOpen) {
                    handleAfterClose();
                  }
                },
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
                footer: resolvedDrawerSlots.footer
                  ? (...args: any[]) =>
                      (resolvedDrawerSlots.footer as Function)(
                        slotScope.value,
                        ...args,
                      )
                  : () => DefaultFooter(slotScope.value),
                ...(() => {
                  const { footer: _, ...rest } = processSlotsWithScope(resolvedDrawerSlots, slotScope.value);
                  return rest;
                })(),
              },
            ),
        },
      );
    };
  },
});

export default DrawerContainer;
