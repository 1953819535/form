import type { FormField } from "@/utils/form";
import type { FilterField } from "@/components/FilterForm";
import type { TableColumnsType } from "antdv-next";
import type {
  TransformParams,
  TransformFormData,
  FormFieldsContext,
  ColumnsContext,
  CrudApi,
  CRUD_OPERATION,
} from "./api";

// 表单配置（支持静态或动态）
export type FormFieldsConfig<
  T extends Record<string, any> = Record<string, any>,
> = FormField<T>[] | ((context: FormFieldsContext<T>) => FormField<T>[]);

// 筛选配置（支持静态或动态）
export type FilterFieldsConfig<
  T extends Record<string, any> = Record<string, any>,
> = FilterField<T>[] | ((formData: T) => FilterField<T>[]);

// 列配置（支持静态数组或动态函数）
export type ColumnsConfig<T extends Record<string, any> = Record<string, any>> =
  | TableColumnsType<T>
  | ((context: ColumnsContext<T>) => TableColumnsType<T>);

// 筛选配置组
export interface CrudFilterConfig<
  T extends Record<string, any> = Record<string, any>,
> {
  fields?: FilterFieldsConfig<T>;
  collapsed?: boolean;
  collapseCount?: number;
  /** 筛选参数转换 */
  transform?: TransformParams;
}

// 表单配置组
export interface CrudFormConfig<
  T extends Record<string, any> = Record<string, any>,
> {
  fields?: FormFieldsConfig<T>;
  type?: "modal" | "drawer";
  props?: Record<string, any>;
  rules?: Record<string, any[]>;
  /** 表单数据转换，提交前处理 */
  transform?: TransformFormData<T>;
}

// 表格配置组
export interface CrudTableConfig<
  T extends Record<string, any> = Record<string, any>,
> {
  columns?: ColumnsConfig<T>;
  rowKey?: string | ((record: T) => string);
  selection?: "none" | "single" | "multiple";
  props?: Record<string, any>;
  /** 是否显示表格内部 loading，默认 true。外部控制 loading 时可设为 false */
  loading?: boolean;
}

// 分页配置组
export interface CrudPaginationConfig {
  enabled?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
}

// 错误提示配置
export interface CrudErrorConfig {
  /** 是否显示错误提示，默认 true */
  show?: boolean;
  /** 自定义错误提示函数 */
  handler?: (error: Error, operation: CRUD_OPERATION) => void;
}

// 事件回调配置组
export interface CrudEventCallbacks<T = any> {
  listSuccess?: (data: T[], total: number) => void;
  listError?: (error: Error) => void;
  createSuccess?: (data: T) => void;
  updateSuccess?: (data: T) => void;
  deleteSuccess?: (id: any) => void;
  selectionChange?: (selectedRows: T[]) => void;
  pageChange?: (page: number, pageSize: number) => void;
}

// useCrud 完整配置
export interface UseCrudOptions<
  T extends Record<string, any> = Record<string, any>,
> {
  // API 配置（必填）
  api: CrudApi<T>;

  // 筛选配置
  filter?: CrudFilterConfig<T>;

  // 表单配置
  form?: CrudFormConfig<T>;

  // 表格配置
  table?: CrudTableConfig<T>;

  // 分页配置
  pagination?: CrudPaginationConfig | false;

  // 错误提示配置
  error?: CrudErrorConfig | false;

  // 事件回调
  on?: CrudEventCallbacks<T>;
}
