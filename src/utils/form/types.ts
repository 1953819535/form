import type { Component, VNodeChild, Ref } from "vue";
import type { ModalProps, FormProps, FormItemProps } from "antdv-next";
import type { Rule } from "antdv-next/dist/form/types";

// ──────────────────────────────────────────────────────────────
// 组件映射与标识类型
// ──────────────────────────────────────────────────────────────

export type SlotRender<T = any> = (scope?: SlotScope<T>) => VNodeChild;

export type ComponentLike = Component | string;

// ──────────────────────────────────────────────────────────────
// 四层配置类型（从外到内：Container → Form → FormItem → Component）
// ──────────────────────────────────────────────────────────────

// Level 1：Modal 配置
export type ModalConfig<T = any> = Partial<
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
  slots?: Record<string, SlotRender<T>>;
};

// Level 1：Drawer 配置
export interface DrawerConfig<T = any> {
  title?: string;
  placement?: "left" | "right" | "top" | "bottom";
  size?: string | number;
  height?: string | number;
  closable?: boolean;
  mask?: boolean;
  maskClosable?: boolean;
  slots?: Record<string, SlotRender<T>>;
  [key: string]: any;
}

// Level 2：Form 配置
export type FormConfig = Partial<Omit<FormProps, "model">> & {
  row?: any;
  slots?: {
    prefix?: SlotRender | VNodeChild;
    suffix?: SlotRender | VNodeChild;
    [key: string]: any;
  };
};

// Level 3：FormItem 配置
export type FormItemConfigExt = Partial<Omit<FormItemProps, "name">> & {
  slots?: Record<string, SlotRender | VNodeChild>;
};

// Level 4：Component 配置
export interface ComponentConfig<
  T extends Record<string, any> = Record<string, any>,
> {
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
  visible?: boolean | ((formData: T) => boolean);
  col?: any;
}

// 动态配置：静态值 | 根据当前表单数据动态计算的函数
export type DynamicConfig<T, R> = R | ((formData: T) => R);

// ──────────────────────────────────────────────────────────────
// 共享表单弹窗配置与返回类型
// ──────────────────────────────────────────────────────────────

// 共享表单配置（不含容器专属配置）
export interface FormDialogConfig<
  T extends Record<string, any> = Record<string, any>,
> {
  form?: DynamicConfig<T, FormConfig>;
  fields: DynamicConfig<T, FormField<T>[]>;
  rules?: DynamicConfig<T, Partial<Record<keyof T & string, Rule[]>>>;
  initialValues?: Partial<T>;
  onSubmit?: (formData: T) => Promise<void>;
}

// createFormModal 完整配置
export interface CreateFormModalConfig<
  T extends Record<string, any> = Record<string, any>,
> extends FormDialogConfig<T> {
  model?: ModalConfig<T>;
}

// createFormDrawer 完整配置
export interface CreateFormDrawerConfig<
  T extends Record<string, any> = Record<string, any>,
> extends FormDialogConfig<T> {
  drawer?: DrawerConfig<T>;
}

// 命令式调用返回结果接口
export interface FormDialogReturn<T> {
  promise: Promise<T>;
  close: () => void;
  validate: () => Promise<any>;
  formState: T;
  formRef: Ref<any>;
}

// ──────────────────────────────────────────────────────────────
// 插槽作用域
// ──────────────────────────────────────────────────────────────

export interface SlotScope<T> {
  formData: T;
  submit: () => void;
  cancel: () => void;
  loading: boolean;
}
