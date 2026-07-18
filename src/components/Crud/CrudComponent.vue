<script setup lang="ts">
import { computed, useSlots } from "vue";
import {
  Table as ATable,
  Pagination as APagination,
  Empty as AEmpty,
} from "antdv-next";
import { FilterForm } from "@/components/FilterForm";
import { resolveRowKey } from "@/utils/form";
import type { CrudComponentProps } from "./types";

// ── Props ──
const props = defineProps<CrudComponentProps<any>>();

// ── 解构 Props（便于模板使用）──
const { state, actions, filter, tableConfig, paginationConfig } = props;
const { loading, dataSource, selectedRows, pagination } = state;
const {
  refresh,
  handleDelete,
  openEditForm,
  handleFilterSearch,
  handlePageChange,
  handleSelectionChange,
} = actions;

// ── 插槽检测 ──
const slots = useSlots();
const hasContentSlot = computed(() => !!slots.content);
const hasFilterSlot = computed(() => !!slots.filter);
const hasToolbarLeftSlot = computed(() => !!slots.toolbarLeft);
const hasToolbarRightSlot = computed(() => !!slots.toolbarRight);
const hasPaginationSlot = computed(() => !!slots.pagination);

// ── 表格行选择配置 ──
const rowSelection = computed(() => {
  const selection = tableConfig?.selection ?? "none";
  if (selection === "none") return undefined;
  const selectedKeys = selectedRows.value.map((row: any) =>
    resolveRowKey(row, tableConfig?.rowKey ?? "id"),
  );
  return {
    type: (selection === "single" ? "radio" : "checkbox") as
      | "radio"
      | "checkbox",
    selectedRowKeys: selectedKeys,
    onChange: (_keys: any[], rows: any[]) => {
      handleSelectionChange(rows);
    },
  };
});

// ── 分页配置 ──
const paginationComputed = computed(() => {
  if (!paginationConfig?.enabled) return false;
  return {
    current: pagination.value.current,
    pageSize: pagination.value.pageSize,
    total: pagination.value.total,
    pageSizeOptions: paginationConfig?.pageSizeOptions,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `共 ${total} 条`,
    onChange: (page: number, pageSize: number) => {
      handlePageChange(page, pageSize);
    },
  };
});
</script>

<template>
  <div class="crud-container">
    <!-- 筛选区域 -->
    <div v-if="filter?.fields || hasFilterSlot" class="crud-filter">
      <slot v-if="hasFilterSlot" name="filter" />
      <FilterForm
        v-else-if="filter?.fields"
        :fields="filter.fields"
        :collapsed="filter.collapsed ?? true"
        :default-collapse-count="filter.collapseCount ?? 3"
        @search="handleFilterSearch"
      />
    </div>

    <!-- 操作栏区域（左右对齐） -->
    <div v-if="hasToolbarLeftSlot || hasToolbarRightSlot" class="crud-toolbar">
      <!-- 左侧操作栏 -->
      <div class="toolbar-left">
        <slot name="toolbarLeft" />
      </div>
      <!-- 右侧操作栏 -->
      <div class="toolbar-right">
        <slot name="toolbarRight" />
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="crud-content">
      <!-- 自定义内容渲染 -->
      <slot
        v-if="hasContentSlot"
        name="content"
        :data-source="dataSource"
        :loading="loading"
        :open-edit-form="openEditForm"
        :handle-delete="handleDelete"
        :refresh="refresh"
      />

      <!-- 默认表格渲染 -->
      <ATable
        v-else
        :columns="tableConfig?.columns"
        :data-source="dataSource"
        :loading="tableConfig?.loading ? loading : false"
        :row-key="tableConfig?.rowKey"
        :row-selection="rowSelection"
        :pagination="false"
        v-bind="tableConfig?.props"
      >
        <!-- 空数据 -->
        <template #emptyText>
          <slot v-if="$slots.empty" name="empty" />
          <AEmpty v-else description="暂无数据" />
        </template>
      </ATable>
    </div>

    <!-- 分页区域 -->
    <div
      v-if="paginationConfig?.enabled && !hasContentSlot"
      class="crud-pagination"
    >
      <slot v-if="hasPaginationSlot" name="pagination" />
      <APagination v-else v-bind="paginationComputed" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "CrudComponent",
});
</script>

<style scoped>
.crud-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.crud-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.crud-content {
  min-height: 200px;
}

.crud-pagination {
  display: flex;
  justify-content: flex-end;
}
</style>
