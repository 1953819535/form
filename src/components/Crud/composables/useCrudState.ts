import { ref, type Ref } from "vue";

// 默认分页大小选项
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// 分页状态类型
export interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

/**
 * CRUD 状态管理
 */
export function useCrudState(pageSize = 10) {
  const loading = ref(false);
  const dataSource = ref<any[]>([]) as Ref<any[]>;
  const selectedRows = ref<any[]>([]) as Ref<any[]>;
  const pagination = ref<PaginationState>({
    current: 1,
    pageSize,
    total: 0,
  });

  return {
    loading,
    dataSource,
    selectedRows,
    pagination,
  };
}

/**
 * 状态类型
 */
export type CrudStateInstance = ReturnType<typeof useCrudState>;
