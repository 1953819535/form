import type { Ref } from "vue";

// CRUD 操作类型
export type CRUD_OPERATION = "list" | "create" | "update" | "delete";

// API 配置
export interface CrudApi<T = any> {
  list: (params: {
    page: number;
    pageSize: number;
    [key: string]: any;
  }) => Promise<{
    data: T[];
    total: number;
  }>;
  create?: (data: Partial<T>) => Promise<void>;
  update?: (id: any, data: Partial<T>) => Promise<void>;
  delete?: (id: any) => Promise<void>;
}

// 请求参数转换函数
export type TransformParams = (
  params: Record<string, any>,
) => Record<string, any>;
export type TransformFormData<T = any> = (
  data: Partial<T>,
  mode: "add" | "edit",
) => Partial<T>;

// 表单配置上下文
export interface FormFieldsContext<T = any> {
  mode: "add" | "edit";
  formData: T;
}

// 列配置上下文（操作方法）
export interface ColumnsContext<T = any> {
  openEditForm: (record: T) => void;
  handleDelete: (id: any) => Promise<void>;
  refresh: () => Promise<void>;
}
