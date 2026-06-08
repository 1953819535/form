<template>
  <div class="demo-section">
    <h3>3. Drawer 表单 + 多选 + 工具栏插槽</h3>
    <ASpin :spinning="loading">
      <CrudComponent>
        <!-- 左侧工具栏：批量操作 -->
        <template #toolbarLeft>
          <AButton
            :disabled="selectedRows.length === 0"
            @click="handleBatchDelete(selectedRows)"
          >
            批量删除 ({{ selectedRows.length }})
          </AButton>
        </template>
        <!-- 右侧工具栏：常规操作 -->
        <template #toolbarRight>
          <div class="toolbar-buttons">
            <AButton @click="refresh()">刷新</AButton>
            <AButton type="primary" @click="openAddForm()">新增</AButton>
          </div>
        </template>
      </CrudComponent>
    </ASpin>
  </div>
</template>

<script setup lang="tsx">
import {
  Button as AButton,
  Spin as ASpin,
  message as AMessage,
  Popconfirm as APopconfirm,
} from "antdv-next";
import {
  useCrud,
  type ColumnsConfig,
  type FormFieldsConfig,
} from "@/components/Crud";
import { createMockUsers, createMockUserApi, type MockUser } from "./mock";

// 创建 mock 数据和 API
const mockUsers = createMockUsers(20);
const userApi = createMockUserApi(mockUsers);

// 表单字段配置
const formFields: FormFieldsConfig<MockUser> = [
  {
    formItem: { name: "name", label: "姓名", required: true },
    component: { is: "AInput" },
  },
  { formItem: { name: "email", label: "邮箱" }, component: { is: "AInput" } },
];

// 列配置
const columns: ColumnsConfig<MockUser> = ({ openEditForm, handleDelete }) => [
  { title: "ID", dataIndex: "id", width: 80 },
  { title: "姓名", dataIndex: "name" },
  { title: "邮箱", dataIndex: "email" },
  {
    title: "操作",
    key: "action",
    width: 150,
    render: (_value: any, record: MockUser) => (
      <div class="action-buttons">
        <AButton type="link" size="small" onClick={() => openEditForm(record)}>
          编辑
        </AButton>
        <APopconfirm
          title="确认删除？"
          onConfirm={() => handleDelete(record.id)}
        >
          <AButton type="link" size="small" danger>
            删除
          </AButton>
        </APopconfirm>
      </div>
    ),
  },
];

// useCrud 返回状态和方法
const { loading, selectedRows, CrudComponent, refresh, openAddForm } =
  useCrud<MockUser>({
    api: userApi,
    form: {
      fields: formFields,
      type: "drawer", // 使用 Drawer 弹窗
    },
    table: {
      columns,
      selection: "multiple", // 多选模式
    },
  });

// 批量删除处理
const handleBatchDelete = (rows: MockUser[]) => {
  const ids = rows.map((row) => row.id);
  AMessage.info(`批量删除: ${ids.join(", ")}`);
};
</script>

<style scoped>
.action-buttons {
  display: flex;
  gap: 8px;
}

.toolbar-buttons {
  display: flex;
  gap: 8px;
}
</style>
