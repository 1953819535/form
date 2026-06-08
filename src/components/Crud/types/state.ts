import type { Ref } from "vue";
import type { TableColumnsType } from "antdv-next";
import type { FilterFieldsConfig } from "./config";
import type { PaginationState } from "../composables/useCrudState";

// 导出 PaginationState 供外部使用
export type { PaginationState };

// useCrud 返回的状态（用户可访问）
export interface CrudState<T = any> {
  loading: Ref<boolean>;
  dataSource: Ref<T[]>;
  selectedRows: Ref<T[]>;
  pagination: Ref<PaginationState>;
}

// useCrud 返回的方法（用户可调用）
export interface CrudActions<T = any> {
  refresh: () => Promise<void>;
  handleDelete: (id: any) => Promise<void>;
  openAddForm: () => void;
  openEditForm: (record: T) => void;
}

// useCrud 返回值
export interface UseCrudReturn<
  T extends Record<string, any> = Record<string, any>,
>
  extends CrudState<T>, CrudActions<T> {
  CrudComponent: any;
}

// CrudComponent Props - 分组结构
export interface CrudComponentProps<
  T extends Record<string, any> = Record<string, any>,
> {
  // 状态
  state: {
    loading: Ref<boolean>;
    dataSource: Ref<T[]>;
    selectedRows: Ref<T[]>;
    pagination: Ref<PaginationState>;
  };

  // 方法
  actions: {
    refresh: () => Promise<void>;
    handleDelete: (id: any) => Promise<void>;
    openAddForm: () => void;
    openEditForm: (record: T) => void;
    handleFilterSearch: (values: Record<string, any>) => void;
    handlePageChange: (page: number, pageSize: number) => void;
    handleSelectionChange: (rows: T[]) => void;
  };

  // 筛选配置
  filter?: {
    fields?: FilterFieldsConfig<T>;
    collapsed?: boolean;
    collapseCount?: number;
  };

  // 表格配置
  tableConfig?: {
    columns?: TableColumnsType<T>;
    rowKey?: string | ((record: T) => string);
    selection?: "none" | "single" | "multiple";
    props?: Record<string, any>;
    loading?: boolean;
  };

  // 分页配置
  paginationConfig?: {
    enabled?: boolean;
    pageSizeOptions?: number[];
  };
}
