import {
  h,
  render,
  defineComponent,
  ref,
  reactive,
  getCurrentInstance,
  type AppContext,
  type Ref,
  type Component,
  type VNodeChild,
} from "vue";
import {
  Modal as AModal,
  Input as AInput,
  Select as ASelect,
  Checkbox as ACheckbox,
  Switch as ASwitch,
  Form as AForm,
  FormItem as AFormItem,
  Row as ARow,
  Col as ACol,
  message as AMessage,
  type ModalProps,
  type FormProps,
  type FormItemProps,
} from "antdv-next";
import type { Rule } from "antdv-next/dist/form/types";

// 字符串 → 组件映射，新增常用组件在此添加即可
const componentMap = {
  AInput,
  ASelect,
  ACheckbox,
  ASwitch,
  ATextarea: AInput.TextArea,
};

type ComponentLike = Component | keyof typeof componentMap;

// 插槽渲染函数，函数形式接收 scope，静态内容由 normalizeSlots 包装为函数
export type SlotRender = (scope?: any) => VNodeChild;

// ── 四层配置类型（Modal → Form → FormItem → Component） ──

// Level 1：Modal 配置，排除由 createForm 内部管理的 open / confirmLoading / getContainer / onCancel / onOk / afterClose
type ModalConfig = Partial<
  Omit<
    ModalProps,
    | "open"
    | "confirmLoading"
    | "getContainer"
    | "onCancel"
    | "onOk"
    | "afterClose"
  >
> & {
  slots?: Record<string, SlotRender | VNodeChild>;
};

// Level 2：Form 配置，排除 model（由内部 reactive 管理）；prefix/suffix 插槽在字段前后插入内容
type FormConfig = Partial<Omit<FormProps, "model">> & {
  row?: any; // 全局 ARow 栅格布局配置（例如 { gutter: 16 }）
  slots?: {
    prefix?: SlotRender | VNodeChild;
    suffix?: SlotRender | VNodeChild;
    [key: string]: any;
  };
};

// Level 3：FormItem 配置，排除 name（由 FormField 显式指定）
type FormItemConfigExt = Partial<Omit<FormItemProps, "name">> & {
  slots?: Record<string, SlotRender | VNodeChild>;
};

// Level 4：Component 配置
interface ComponentConfig<T extends Record<string, any> = Record<string, any>> {
  is: ComponentLike;
  modelPropName?: string;
  models?: { [prop: string]: keyof T & string };
  slots?: Record<string, SlotRender | VNodeChild>;
  [key: string]: any;
}

// Level 3 + Level 4 组合
export interface FormField<
  T extends Record<string, any> = Record<string, any>,
> {
  formItem: FormItemConfigExt & { name: keyof T & string };
  component: ComponentConfig<T>;
  visible?: boolean | ((formData: T) => boolean); // 字段级显隐控制
  col?: any; // 字段对应的 ACol 配置（支持传入数字如 12，或配置对象）
}

// 动态配置：静态值 | 根据当前表单数据动态计算的函数
type DynamicConfig<T, R> = R | ((formData: T) => R);

// createForm 完整配置
export interface CreateFormConfig<
  T extends Record<string, any> = Record<string, any>,
> {
  appContext?: AppContext; // 外部显式传入 Vue 实例上下文（继承国际化/主题/状态）
  model?: ModalConfig;
  form?: DynamicConfig<T, FormConfig>;
  fields: DynamicConfig<T, FormField<T>[]>;
  rules?: DynamicConfig<T, Partial<Record<keyof T & string, Rule[]>>>;
  initialValues?: Partial<T>;
  onSubmit?: (formData: T) => Promise<void>;
}

// 命令式调用返回结果接口
export interface CreateFormReturn<T> {
  promise: Promise<T>;
  close: () => void;
  validate: () => Promise<any>;
  formState: T;
  formRef: Ref<any>;
}

// 将 slots 配置统一转为函数形式：函数直接保留，非函数包装为 (...args) => val
const normalizeSlots = (slotsConfig?: Record<string, any>) => {
  if (!slotsConfig) return undefined;
  const normalized: Record<string, any> = {};
  Object.entries(slotsConfig).forEach(([key, val]) => {
    normalized[key] = typeof val === "function" ? val : (...args: any[]) => val;
  });
  return normalized;
};

/**
 * 命令式创建 Modal + Form 弹窗
 *
 * 提交时 resolve 表单数据，取消时 reject
 */
export const createForm = <T extends Record<string, any> = Record<string, any>>(
  config: CreateFormConfig<T>,
): CreateFormReturn<T> => {
  // 自动获取当前的 appContext (如果是在 setup 阶段调用的话)
  const currentInstance = getCurrentInstance();
  const appContext = config.appContext || currentInstance?.appContext;

  // 动态创建挂载容器
  const container = document.createElement("div");
  document.body.appendChild(container);

  // 初始化 formState：先从 fields 提取所有键（确保响应性），再用 initialValues 覆盖
  // 注意：内部使用普通的 Record<string, any> 类型，在外部调用或暴露时断言为 T，避开 TS2862 的泛型索引写入限制
  const initialData: Record<string, any> = {};
  const initialFields =
    typeof config.fields === "function"
      ? config.fields((config.initialValues ?? {}) as T)
      : config.fields;

  initialFields.forEach((field) => {
    initialData[field.formItem.name as string] = undefined;
  });

  const formState = reactive<Record<string, any>>({
    ...initialData,
    ...(config.initialValues ?? {}),
  });

  const open = ref(true);
  const confirmLoading = ref(false);
  const formRef = ref<any>(null);

  let resolvePromise: ((value: T | PromiseLike<T>) => void) | null = null;
  let rejectPromise: ((reason?: any) => void) | null = null;

  const handleCancel = () => {
    rejectPromise?.(new Error("用户取消"));
    open.value = false;
  };

  // 校验 → onSubmit → resolve → 关闭；onSubmit 异常则提示错误并保持弹窗
  const handleOk = async () => {
    try {
      if (formRef.value) {
        await formRef.value.validate();
      }
    } catch {
      return;
    }

    try {
      confirmLoading.value = true;
      if (typeof config.onSubmit === "function") {
        await config.onSubmit(formState as T);
      }
      resolvePromise?.(formState as T);
      open.value = false;
    } catch (error: any) {
      AMessage.error(error.message || "提交失败");
    } finally {
      confirmLoading.value = false;
    }
  };

  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;

    const FormWrapper = defineComponent({
      setup() {
        // 关闭动画结束后销毁 DOM
        const destroy = () => {
          render(null, container);
          container.remove();
        };

        return () => {
          const currentFormData = formState as T;

          // 动态解析：fields / form / rules 均支持函数形式
          const activeFields =
            typeof config.fields === "function"
              ? config.fields(currentFormData)
              : config.fields;

          const activeFormConfig =
            typeof config.form === "function"
              ? config.form(currentFormData)
              : config.form || {};

          const activeRules =
            typeof config.rules === "function"
              ? config.rules(currentFormData)
              : config.rules;

          // 1. 过滤 visible 字段
          const visibleFields = activeFields.filter((field) => {
            if (field.visible === undefined) return true;
            if (typeof field.visible === "function") {
              return field.visible(currentFormData);
            }
            return !!field.visible;
          });

          // 2. 检查是否开启栅格排版
          const hasGrid =
            visibleFields.some((f) => f.col !== undefined) ||
            !!activeFormConfig.row;

          // ── 渲染 Level 3 + Level 4 ──
          const formItems = visibleFields.map((field) => {
            const {
              is,
              modelPropName = "value",
              models,
              slots: componentSlotsConfig,
              ...restProps
            } = field.component;

            // 字符串标识从 componentMap 查找，否则直接作为组件
            const Component =
              typeof is === "string" && is in componentMap
                ? componentMap[is as keyof typeof componentMap]
                : (is as Component);

            // 主双向绑定：[modelPropName] + onUpdate:[modelPropName]
            const modelProps: Record<string, any> = {
              [modelPropName]: formState[field.formItem.name as string],
              [`onUpdate:${modelPropName}`]: (val: any) => {
                formState[field.formItem.name as string] = val;
              },
            };

            // 多重双向绑定，如日期范围选择器同时绑定 startTime / endTime
            if (models) {
              Object.entries(models).forEach(([prop, stateKey]) => {
                modelProps[prop] = formState[stateKey];
                modelProps[`onUpdate:${prop}`] = (val: any) => {
                  formState[stateKey] = val;
                };
              });
            }

            // 事件拦截：onXxx（排除 onUpdate:xxx）自动注入 formState 作为最后参数
            const componentProps: Record<string, any> = {};
            const eventProps: Record<string, any> = {};

            Object.entries(restProps).forEach(([key, val]) => {
              if (
                /^on[A-Z]/.test(key) &&
                !key.startsWith("onUpdate:") &&
                typeof val === "function"
              ) {
                eventProps[key] = (...args: any[]) => {
                  (val as Function)(...args, formState as T);
                };
              } else {
                componentProps[key] = val;
              }
            });

            // Level 4：Component
            const resolvedComponentSlots = normalizeSlots(componentSlotsConfig);
            const componentNode = h(
              Component,
              { ...componentProps, ...eventProps, ...modelProps },
              resolvedComponentSlots,
            );

            // Level 3：FormItem，default 插槽填充 Component
            const { slots: formItemSlotsConfig, ...restFormItemProps } =
              field.formItem;
            const resolvedFormItemSlots =
              normalizeSlots(formItemSlotsConfig) || {};
            const { default: formItemDefault, ...otherFormItemSlots } =
              resolvedFormItemSlots;

            const formItemSlots = {
              default: () => componentNode,
              ...otherFormItemSlots,
            };

            const formItemNode = h(AFormItem, restFormItemProps, formItemSlots);

            // 栅格排版下将 FormItem 包裹到 ACol
            if (hasGrid) {
              const colProps =
                typeof field.col === "number"
                  ? { span: field.col }
                  : field.col || {};
              return h(ACol, colProps, { default: () => formItemNode });
            }

            return formItemNode;
          });

          // ── Level 2：Form ──
          const {
            slots: formSlotsConfig,
            row: formRowProps,
            ...restFormProps
          } = activeFormConfig;
          const resolvedFormSlots = normalizeSlots(formSlotsConfig) || {};
          const {
            prefix,
            suffix,
            default: formDefault,
            ...otherFormSlots
          } = resolvedFormSlots;

          const formSlots = {
            default: () => {
              const mainContent = hasGrid
                ? h(ARow, formRowProps || {}, { default: () => formItems })
                : formItems;
              return [prefix?.(), mainContent, suffix?.()].filter(Boolean);
            },
            ...otherFormSlots,
          };

          const formNode = h(
            AForm,
            {
              ...restFormProps,
              ref: formRef,
              model: formState,
              rules: activeRules as any,
            },
            formSlots,
          );

          // ── Level 1：Modal ──
          const { slots: modalSlotsConfig, ...restModalProps } =
            config.model || {};
          const resolvedModalSlots = normalizeSlots(modalSlotsConfig) || {};
          const { default: modalDefault, ...otherModalSlots } =
            resolvedModalSlots;

          // 作用域包装，注入到 Modal 所有的非 default 插槽内（例如 footer、title 插槽）
          const slotScope = {
            formData: formState as T,
            submit: handleOk,
            cancel: handleCancel,
            loading: confirmLoading.value,
          };

          const modalSlots: Record<string, any> = {
            default: () => formNode,
          };

          Object.entries(otherModalSlots).forEach(([key, slotFn]) => {
            modalSlots[key] = () => slotFn(slotScope);
          });

          return h(
            AModal,
            {
              ...restModalProps,
              open: open.value,
              confirmLoading: confirmLoading.value,
              getContainer: () => container,
              onCancel: handleCancel,
              onOk: handleOk,
              afterClose: destroy,
            },
            modalSlots,
          );
        };
      },
    });

    const vnode = h(FormWrapper);
    // 注入全局/父级实例上下文，使弹窗能感知 Pinia、Router、ConfigProvider
    if (appContext) {
      vnode.appContext = appContext;
    }
    render(vnode, container);
  });

  return {
    promise,
    close: () => {
      rejectPromise?.(new Error("用户手动关闭"));
      open.value = false;
    },
    validate: () => {
      if (!formRef.value) {
        return Promise.reject(new Error("表单实例尚未挂载"));
      }
      return formRef.value.validate();
    },
    formState: formState as T, // 显式类型转换，使其对外暴露为强类型数据引用
    formRef,
  };
};

/**
 * Composition API 版本的 createForm 辅助钩子
 * 在组件 setup 内调用此函数，会自动为您捕获当前 Vue App 运行上下文并透传
 */
export const useCreateForm = () => {
  const currentInstance = getCurrentInstance();
  const appContext = currentInstance?.appContext;

  const showForm = <T extends Record<string, any> = Record<string, any>>(
    config: CreateFormConfig<T>,
  ) => {
    return createForm<T>({
      appContext, // 自动透传 parentAppContext
      ...config,
    });
  };

  return { showForm };
};
