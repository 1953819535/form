<template>
  <div class="demo-section">
    <h3>6. 表格 Props 透传</h3>
    <CrudComponent>
      <template #toolbarRight>
        <div class="toolbar-buttons">
          <AButton type="primary" @click="openAddForm()">新增</AButton>
        </div>
      </template>
    </CrudComponent>
  </div>
</template>

<script setup lang="tsx">
import {
  Button as AButton,
  Popconfirm as APopconfirm,
  Tag as ATag,
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

// 列配置（使用 JSX 渲染状态标签）
const columns: ColumnsConfig<MockUser> = ({ openEditForm, handleDelete }) => [
  { title: "ID", dataIndex: "id", width: 80 },
  { title: "姓名", dataIndex: "name" },
  { title: "邮箱", dataIndex: "email" },
  {
    title: "状态",
    dataIndex: "status",
    width: 100,
    render: (_value: any, record: MockUser) => (
      <ATag color={record.status === "active" ? "green" : "default"}>
        {record.status === "active" ? "启用" : "禁用"}
      </ATag>
    ),
  },
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

// useCrud 配置
const { CrudComponent, openAddForm } = useCrud<MockUser>({
  api: userApi,
  form: { fields: formFields },
  table: {
    columns,
    // 表格 props 透传：边框、尺寸、斑马纹等
    props: {
      bordered: true,
      size: "middle" as const,
      rowClassName: (_record: MockUser, index: number) =>
        index % 2 === 1 ? "table-row-striped" : "",
    },
  },
});
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

/* 斑马纹样式 */
:deep(.table-row-striped) {
  background-color: #fafafa;
}
</style>
