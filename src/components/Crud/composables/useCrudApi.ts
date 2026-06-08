import { message } from "antdv-next";
import { ref } from "vue";
import type {
  CrudApi,
  TransformParams,
  CrudErrorConfig,
  CRUD_OPERATION,
} from "../types";
import type { CrudStateInstance } from "./useCrudState";

/**
 * API 操作相关逻辑
 */
export function useCrudApi<T extends Record<string, any>>(
  state: CrudStateInstance,
  api: CrudApi<T>,
  filterTransform?: TransformParams,
  errorConfig?: CrudErrorConfig,
  callbacks?: {
    onListSuccess?: (data: T[], total: number) => void;
    onListError?: (error: Error) => void;
    onDeleteSuccess?: (id: any) => void;
    onPageChange?: (page: number, pageSize: number) => void;
  },
) {
  const { loading, dataSource, pagination } = state;
  const filterValues = ref<Record<string, any>>({});

  // 错误处理
  const handleError = (error: Error, operation: CRUD_OPERATION) => {
    if (errorConfig?.handler) {
      errorConfig.handler(error, operation);
    } else if (errorConfig?.show) {
      message.error(error.message || "操作失败");
    }
  };

  // 加载数据
  const refresh = async () => {
    loading.value = true;
    try {
      let params = {
        page: pagination.value.current,
        pageSize: pagination.value.pageSize,
        ...filterValues.value,
      };

      // 筛选参数转换
      if (filterTransform) {
        params = filterTransform(params) as typeof params;
      }

      const res = await api.list(params);
      dataSource.value = res.data;
      pagination.value.total = res.total;
      callbacks?.onListSuccess?.(res.data, res.total);
    } catch (error) {
      handleError(error as Error, "list");
      callbacks?.onListError?.(error as Error);
    } finally {
      loading.value = false;
    }
  };

  // 删除
  const handleDelete = async (id: any) => {
    if (!api.delete) return;
    try {
      await api.delete(id);
      if (errorConfig?.show) {
        message.success("删除成功");
      }
      callbacks?.onDeleteSuccess?.(id);
      refresh();
    } catch (error) {
      handleError(error as Error, "delete");
    }
  };

  // 筛选搜索
  const handleFilterSearch = (values: Record<string, any>) => {
    filterValues.value = values;
    pagination.value.current = 1;
    refresh();
  };

  // 分页变化
  const handlePageChange = (page: number, newPageSize: number) => {
    pagination.value.current = page;
    pagination.value.pageSize = newPageSize;
    callbacks?.onPageChange?.(page, newPageSize);
    refresh();
  };

  return {
    refresh,
    handleDelete,
    handleFilterSearch,
    handlePageChange,
  };
}
