import { defineComponent, h, ref, computed, toRaw, nextTick, type PropType } from "vue";
import {
  Form as AForm,
  FormItem as AFormItem,
  Row as ARow,
  Col as ACol,
  message as AMessage,
} from "antdv-next";
import type { Rule } from "antdv-next/dist/form/types";
import type { FormConfig, FormField, DynamicConfig, ComponentLike } from "./types";
import { normalizeSlots, resolveComponent } from "./renderHelper";

// ──────────────────────────────────────────────────────────────
// 共享表单渲染组件
// 接收 fields / rules / form 配置，渲染 AForm + AFormItem + 动态组件
// 通过 defineExpose 暴露 formRef 的 validate 方法
// ──────────────────────────────────────────────────────────────
const RenderForm = defineComponent({
  name: "RenderForm",
  props: {
    formState: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    fields: {
      type: [Array, Function] as PropType<DynamicConfig<any, FormField<any>[]>>,
      required: true,
    },
    rules: {
      type: [Object, Function] as PropType<
        DynamicConfig<any, Partial<Record<string, Rule[]>>> | undefined
      >,
      default: undefined,
    },
    form: {
      type: [Object, Function] as PropType<
        DynamicConfig<any, FormConfig> | undefined
      >,
      default: undefined,
    },
    onSubmit: {
      type: Function as PropType<
        ((formData: any) => Promise<void>) | undefined
      >,
      default: undefined,
    },
    onAutoSearch: {
      type: Function as PropType<(formData: any) => void>,
      default: undefined,
    },
    // 不包裹外层 AForm，仅渲染字段节点（用于外层已有 AForm 的场景，如 FilterForm inline 布局）
    noWrapper: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["resolve", "reject"],
  setup(props, { emit, expose }) {
    // ── 自动搜索触发规则 ──
    const IMMEDIATE_COMPONENTS = [
      'ASelect', 'ADatePicker', 'ARangePicker',
      'ACheckbox', 'ASwitch', 'ARadioGroup'
    ];
    const ENTER_COMPONENTS = ['AInput', 'AInputNumber', 'ATextarea'];

    const getTriggerType = (is: ComponentLike): 'immediate' | 'enter' => {
      const name = typeof is === 'string' ? is : (is as any).name || '';
      if (IMMEDIATE_COMPONENTS.includes(name)) return 'immediate';
      if (ENTER_COMPONENTS.includes(name)) return 'enter';
      return 'immediate';
    };

    const formRef = ref<any>();
    const loading = ref(false);

    // ── 动态配置解析 ──
    const resolvedFields = computed(() =>
      typeof props.fields === "function"
        ? props.fields(props.formState as any)
        : props.fields,
    );
    const resolvedRules = computed(() =>
      typeof props.rules === "function"
        ? props.rules(props.formState as any)
        : props.rules,
    );
    const resolvedForm = computed(() =>
      typeof props.form === "function"
        ? props.form(props.formState as any)
        : props.form,
    );

    // ── 提交 ──
    const handleSubmit = async () => {
      try {
        await formRef.value?.validate();
      } catch {
        return;
      }

      loading.value = true;
      try {
        const rawData = toRaw(props.formState);
        if (props.onSubmit) {
          await props.onSubmit(rawData);
        }
        emit("resolve", rawData);
      } catch (err: any) {
        AMessage.error(err?.message || "提交失败");
      } finally {
        loading.value = false;
      }
    };

    // 暴露给父容器
    expose({ handleSubmit, formRef, loading });

    // ── 渲染单个字段 ──
    const renderFieldNode = (field: FormField<any>) => {
      const {
        is,
        modelPropName = "value",
        models,
        slots: componentSlotsConfig,
        ...restProps
      } = field.component;

      const Component = resolveComponent(is);

      // 主双向绑定
      const modelProps: Record<string, any> = {
        [modelPropName]: props.formState[field.formItem.name as string],
        [`onUpdate:${modelPropName}`]: (val: any) => {
          props.formState[field.formItem.name as string] = val;
        },
      };

      // 多重双向绑定
      if (models) {
        Object.entries(models).forEach(([prop, stateKey]) => {
          modelProps[prop] = props.formState[stateKey];
          modelProps[`onUpdate:${prop}`] = (val: any) => {
            props.formState[stateKey] = val;
          };
        });
      }

      // 事件拦截：onXxx 自动注入 formState
      const componentProps: Record<string, any> = {};
      const eventProps: Record<string, any> = {};
      Object.entries(restProps).forEach(([key, val]) => {
        if (
          /^on[A-Z]/.test(key) &&
          !key.startsWith("onUpdate:") &&
          typeof val === "function"
        ) {
          eventProps[key] = (...args: any[]) => {
            (val as Function)(...args, props.formState);
          };
        } else {
          componentProps[key] = val;
        }
      });

      // ── 自动搜索事件绑定 ──
      if (props.onAutoSearch) {
        const trigger = field.component.trigger ?? getTriggerType(field.component.is);

        if (trigger === 'immediate') {
          // 保存原有的 onChange
          const originalOnChange = eventProps.onChange;
          eventProps.onChange = (...args: any[]) => {
            if (originalOnChange) originalOnChange(...args);
            // 延迟触发，确保 v-model 已更新
            nextTick(() => {
              props.onAutoSearch?.(toRaw(props.formState));
            });
          };
        } else if (trigger === 'enter') {
          // onPressEnter 事件
          const originalOnPressEnter = restProps.onPressEnter;
          eventProps.onPressEnter = (...args: any[]) => {
            if (originalOnPressEnter) originalOnPressEnter(...args, props.formState);
            props.onAutoSearch?.(toRaw(props.formState));
          };
        }
      }

      // Component 渲染
      const resolvedComponentSlots = normalizeSlots(componentSlotsConfig);
      const componentNode = h(
        Component,
        { ...componentProps, ...eventProps, ...modelProps },
        resolvedComponentSlots,
      );

      // FormItem 渲染
      const { slots: formItemSlotsConfig, ...restFormItemProps } =
        field.formItem;
      const resolvedFormItemSlots = normalizeSlots(formItemSlotsConfig) || {};
      const { default: _, ...otherFormItemSlots } = resolvedFormItemSlots;

      const formItemNode = h(AFormItem, restFormItemProps, {
        default: () => componentNode,
        ...otherFormItemSlots,
      });

      // Col 包裹
      if (field.col || resolvedForm.value?.row) {
        return h(ACol, field.col || {}, () => formItemNode);
      }

      return formItemNode;
    };

    // ── 主渲染 ──
    return () => {
      const formConfig = resolvedForm.value || {};
      const { row, slots: formSlotsConfig, ...restFormProps } = formConfig;
      const resolvedFormSlots = normalizeSlots(formSlotsConfig) || {};
      const { prefix, suffix, ...otherFormSlots } = resolvedFormSlots;

      const visibleFields = resolvedFields.value.filter((field) => {
        if (field.visible === undefined) return true;
        if (typeof field.visible === "function") {
          return field.visible(props.formState as any);
        }
        return field.visible;
      });

      const fieldNodes = visibleFields.map(renderFieldNode);

      const formChildren = [
        ...(prefix ? [prefix()] : []),
        row ? h(ARow, row, () => fieldNodes) : fieldNodes,
        ...(suffix ? [suffix()] : []),
      ];

      // noWrapper 模式：直接返回子节点，不包裹 AForm
      if (props.noWrapper) {
        return formChildren;
      }

      return h(
        AForm,
        {
          ref: formRef,
          model: props.formState,
          rules: resolvedRules.value as any,
          ...restFormProps,
        },
        { default: () => formChildren, ...otherFormSlots },
      );
    };
  },
});

export default RenderForm;
