import { onMounted, defineComponent, h, ref, type Ref } from "vue";
import { useCrudApi, useCrudForm } from "./composables";
import CrudComponent from "./CrudComponent.vue";
import type {
  UseCrudOptions,
  UseCrudReturn,
  PaginationState,
} from "./types";

/**
 * CRUD 组合式函数
 *
 * @example
 * ```ts
 * const { loading, CrudComponent, refresh, openAddForm } = useCrud({
 *   api: userApi,
 *   filter: { fields: userFilterFields },
 *   form: { fields: userFormFields },
 *   table: { columns: userColumns },
 * });
 * ```
 */
export function useCrud<T extends Record<string, any>>(
  options: UseCrudOptions<T>,
): UseCrudReturn<T> {
  const {
    api,
    filter,
    form,
    table,
    pagination: paginationConfig,
    error: errorConfig,
    on,
  } = options;

  // 解构配置
  const {
    fields: filterFields,
    collapsed: filterCollapsed = true,
    collapseCount: filterCollapseCount = 3,
    transform: filterTransform,
  } = filter || {};

  const {
    columns,
    rowKey = "id",
    selection = "none",
    props: tableProps,
    loading: tableLoading = true,
  } = table || {};

  // 分页配置
  const paginationDisabled = paginationConfig === false;
  const paginationEnabled = paginationDisabled
    ? false
    : (paginationConfig?.enabled ?? true);
  const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
  const pageSize = paginationDisabled ? 10 : (paginationConfig?.pageSize ?? 10);
  const pageSizeOptions: number[] = paginationDisabled
    ? [...PAGE_SIZE_OPTIONS]
    : (paginationConfig?.pageSizeOptions ?? [...PAGE_SIZE_OPTIONS]);

  // 错误配置
  const errorDisabled = errorConfig === false;
  const errorShow = errorDisabled ? false : (errorConfig?.show ?? true);
  const errorHandler = errorDisabled ? undefined : errorConfig?.handler;

  // 状态
  const loading = ref(false);
  const dataSource = ref<T[]>([]) as Ref<T[]>;
  const selectedRows = ref<T[]>([]) as Ref<T[]>;
  const pagination = ref<PaginationState>({
    current: 1,
    pageSize,
    total: 0,
  });

  // API 操作
  const apiOps = useCrudApi<T>(
    { loading, dataSource, pagination },
    api,
    filterTransform,
    { show: errorShow, handler: errorHandler },
    {
      onListSuccess: on?.listSuccess,
      onListError: on?.listError,
      onDeleteSuccess: on?.deleteSuccess,
      onPageChange: on?.pageChange,
    },
  );
  const { refresh, handleDelete, handleFilterSearch, handlePageChange } =
    apiOps;

  // 表单弹窗
  const formOps = useCrudForm<T>(
    form,
    rowKey,
    api,
    { show: errorShow, handler: errorHandler },
    {
      onCreateSuccess: on?.createSuccess,
      onUpdateSuccess: on?.updateSuccess,
    },
    refresh,
  );
  const { openAddForm, openEditForm } = formOps;

  // 选择变化
  const handleSelectionChange = (rows: T[]) => {
    selectedRows.value = rows;
    on?.selectionChange?.(rows);
  };

  // 解析列配置（初始化时执行一次）
  const resolvedColumns =
    typeof columns === "function"
      ? columns({
          openEditForm,
          handleDelete,
          refresh,
        })
      : columns || [];

  // 初始化加载
  onMounted(() => {
    refresh();
  });

  // 创建组件
  const CrudComponentInstance = defineComponent({
    name: "CrudComponent",
    setup(_, { slots, expose }) {
      expose({
        refresh,
        handleDelete,
        openAddForm,
        openEditForm,
        loading,
        dataSource,
        selectedRows,
        pagination,
      });

      return () =>
        h(
          CrudComponent,
          {
            // 状态
            state: {
              loading,
              dataSource,
              selectedRows,
              pagination,
            },
            // 方法
            actions: {
              refresh,
              handleDelete,
              openAddForm,
              openEditForm,
              handleFilterSearch,
              handlePageChange,
              handleSelectionChange,
            },
            // 筛选配置
            filter: {
              fields: filterFields,
              collapsed: filterCollapsed,
              collapseCount: filterCollapseCount,
            },
            // 表格配置
            tableConfig: {
              columns: resolvedColumns,
              rowKey,
              selection,
              props: tableProps,
              loading: tableLoading,
            },
            // 分页配置
            paginationConfig: {
              enabled: paginationEnabled,
              pageSizeOptions,
            },
          },
          slots,
        );
    },
  });

  return {
    loading,
    dataSource,
    selectedRows,
    pagination,
    refresh,
    handleDelete,
    openAddForm,
    openEditForm,
    CrudComponent: CrudComponentInstance,
  };
}
