import type { FormField } from "@/utils/form";

// 筛选字段配置（复用 FormField）
export type FilterField<T extends Record<string, any> = Record<string, any>> =
  FormField<T>;

// 筛选组件 Props
export interface FilterFormProps<
  T extends Record<string, any> = Record<string, any>,
> {
  // 字段配置
  fields: FilterField<T>[] | ((formData: T) => FilterField<T>[]);

  // 数据绑定
  modelValue?: T;
  initialValues?: Partial<T>;

  // 状态
  loading?: boolean;

  // 布局配置
  layout?: "inline" | "grid";
  columns?: number;
  rowGutter?: number;
  colGutter?: number;

  // 展开收起配置
  collapsed?: boolean;
  defaultCollapseCount?: number;
  showCollapseButton?: boolean;

  // 操作按钮配置
  showSearchButton?: boolean;
  showResetButton?: boolean;
  searchButtonText?: string;
  resetButtonText?: string;
  buttonColSpan?: number;

  // 自动搜索
  onAutoSearch?: (formData: T) => void;
}

// 筛选组件 Emits
export interface FilterFormEmits<
  T extends Record<string, any> = Record<string, any>,
> {
  "update:modelValue": (value: T) => void;
  search: (value: T) => void;
  reset: (value: T) => void;
  collapseChange: (collapsed: boolean) => void;
  autoSearch: (value: T) => void;
}
