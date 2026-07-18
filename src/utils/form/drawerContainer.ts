import { defineComponent, h, type PropType } from "vue";
import {
  Drawer as ADrawer,
  Button as AButton,
  ConfigProvider as AConfigProvider,
} from "antdv-next";
import type { DrawerConfig, SlotScope } from "./types";
import { normalizeSlots, processSlotsWithScope } from "./renderHelper";
import { useFormDialog } from "./useFormDialog";
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
    const { open, handleCancel, slotScope, renderForm } = useFormDialog(
      props,
      emit,
      expose,
    );

    return () => {
      const { slots: drawerSlotsConfig, ...restDrawerProps } =
        props.drawer || {};
      const resolvedDrawerSlots = normalizeSlots(drawerSlotsConfig) || {};
      const { footer: _, ...otherSlots } = processSlotsWithScope(
        resolvedDrawerSlots,
        slotScope.value,
      );

      return h(AConfigProvider, antdConfig, {
        default: () =>
          h(
            ADrawer,
            {
              ...restDrawerProps,
              open: open.value,
              onClose: handleCancel,
              afterOpenChange: (isOpen: boolean) => {
                if (!isOpen) emit("close");
              },
            },
            {
              default: renderForm,
              footer: resolvedDrawerSlots.footer
                ? (...args: any[]) =>
                    (resolvedDrawerSlots.footer as Function)(
                      slotScope.value,
                      ...args,
                    )
                : () => DefaultFooter(slotScope.value),
              ...otherSlots,
            },
          ),
      });
    };
  },
});

export default DrawerContainer;
