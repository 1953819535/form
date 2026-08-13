import type { Ref } from "vue";
import type { TableColumnsType } from "antdv-next";
import type { FormField } from "@/utils/form";
import type { FilterField } from "@/components/FilterForm";

// ──────────────────────────────────────────────────────────────
// 分页状态
// ──────────────────────────────────────────────────────────────

export interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

// ──────────────────────────────────────────────────────────────
// API 相关
// ──────────────────────────────────────────────────────────────

export type CRUD_OPERATION = "list" | "create" | "update" | "delete";

export interface CrudApi<T = any> {
  list: (params: {
    page: number;
    pageSize: number;
    [key: string]: unknown;
  }) => Promise<{
    data: T[];
    total: number;
  }>;
  create?: (data: Partial<T>) => Promise<void>;
  update?: (id: any, data: Partial<T>) => Promise<void>;
  delete?: (id: any) => Promise<void>;
}

export type TransformParams = (
  params: Record<string, unknown>,
) => Record<string, unknown>;

export type TransformFormData<T = any> = (
  data: Partial<T>,
  mode: "add" | "edit",
) => Partial<T>;

export interface FormFieldsContext<T = any> {
  mode: "add" | "edit";
  formData: T;
}

export interface ColumnsContext<T = any> {
  openEditForm: (record: T) => void;
  handleDelete: (id: any) => Promise<void>;
  refresh: () => Promise<void>;
}

// ──────────────────────────────────────────────────────────────
// 配置类型（支持静态值或动态函数）
// ──────────────────────────────────────────────────────────────

export type FormFieldsConfig<
  T extends Record<string, any> = Record<string, any>,
> = FormField<T>[] | ((context: FormFieldsContext<T>) => FormField<T>[]);

export type FilterFieldsConfig<
  T extends Record<string, any> = Record<string, any>,
> = FilterField<T>[] | ((formData: T) => FilterField<T>[]);

export type ColumnsConfig<
  T extends Record<string, any> = Record<string, any>,
> =
  | TableColumnsType<T>
  | ((context: ColumnsContext<T>) => TableColumnsType<T>);

// ──────────────────────────────────────────────────────────────
// 分组配置
// ──────────────────────────────────────────────────────────────

export interface CrudFilterConfig<
  T extends Record<string, any> = Record<string, any>,
> {
  fields?: FilterFieldsConfig<T>;
  collapsed?: boolean;
  collapseCount?: number;
  /** 筛选参数转换 */
  transform?: TransformParams;
}

export interface CrudFormConfig<
  T extends Record<string, any> = Record<string, any>,
> {
  fields?: FormFieldsConfig<T>;
  type?: "modal" | "drawer";
  props?: Record<string, unknown>;
  rules?: Record<string, any[]>;
  /** 表单数据转换，提交前处理 */
  transform?: TransformFormData<T>;
}

export interface CrudTableConfig<
  T extends Record<string, any> = Record<string, any>,
> {
  columns?: ColumnsConfig<T>;
  rowKey?: string | ((record: T) => string);
  selection?: "none" | "single" | "multiple";
  props?: Record<string, unknown>;
  /** 是否显示表格内部 loading，默认 true。外部控制 loading 时可设为 false */
  loading?: boolean;
}

export interface CrudPaginationConfig {
  enabled?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
}

export interface CrudErrorConfig {
  /** 是否显示错误提示，默认 true */
  show?: boolean;
  /** 自定义错误提示函数 */
  handler?: (error: Error, operation: CRUD_OPERATION) => void;
}

export interface CrudEventCallbacks<T = any> {
  listSuccess?: (data: T[], total: number) => void;
  listError?: (error: Error) => void;
  createSuccess?: (data: T) => void;
  updateSuccess?: (data: T) => void;
  deleteSuccess?: (id: any) => void;
  selectionChange?: (selectedRows: T[]) => void;
  pageChange?: (page: number, pageSize: number) => void;
}

export interface UseCrudOptions<
  T extends Record<string, any> = Record<string, any>,
> {
  api: CrudApi<T>;
  filter?: CrudFilterConfig<T>;
  form?: CrudFormConfig<T>;
  table?: CrudTableConfig<T>;
  pagination?: CrudPaginationConfig | false;
  error?: CrudErrorConfig | false;
  on?: CrudEventCallbacks<T>;
}

// ──────────────────────────────────────────────────────────────
// useCrud 返回值与 CrudComponent Props
// ──────────────────────────────────────────────────────────────

export interface CrudState<T = any> {
  loading: Ref<boolean>;
  dataSource: Ref<T[]>;
  selectedRows: Ref<T[]>;
  pagination: Ref<PaginationState>;
}

/** `useCrudApi` 需要的状态的子集 */
export type CrudApiState<T = any> = Pick<
  CrudState<T>,
  "loading" | "dataSource" | "pagination"
>;

export interface CrudActions<T = any> {
  refresh: () => Promise<void>;
  handleDelete: (id: any) => Promise<void>;
  openAddForm: () => void;
  openEditForm: (record: T) => void;
}

export interface UseCrudReturn<
  T extends Record<string, any> = Record<string, any>,
>
  extends CrudState<T>, CrudActions<T> {
  CrudComponent: any;
}

export interface CrudComponentProps<
  T extends Record<string, any> = Record<string, any>,
> {
  state: {
    loading: Ref<boolean>;
    dataSource: Ref<T[]>;
    selectedRows: Ref<T[]>;
    pagination: Ref<PaginationState>;
  };
  actions: {
    refresh: () => Promise<void>;
    handleDelete: (id: any) => Promise<void>;
    openAddForm: () => void;
    openEditForm: (record: T) => void;
    handleFilterSearch: (values: Record<string, any>) => void;
    handlePageChange: (page: number, pageSize: number) => void;
    handleSelectionChange: (rows: T[]) => void;
  };
  filter?: {
    fields?: FilterFieldsConfig<T>;
    collapsed?: boolean;
    collapseCount?: number;
  };
  tableConfig?: {
    columns?: TableColumnsType<T>;
    rowKey?: string | ((record: T) => string);
    selection?: "none" | "single" | "multiple";
    props?: Record<string, unknown>;
    loading?: boolean;
  };
  paginationConfig?: {
    enabled?: boolean;
    pageSizeOptions?: number[];
  };
}
