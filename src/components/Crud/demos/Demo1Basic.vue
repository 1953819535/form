<template>
  <div class="demo-section">
    <h3>1. 基础用法</h3>
    <ASpin :spinning="loading">
      <CrudComponent>
        <!-- 右侧工具栏 -->
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
  Popconfirm as APopconfirm,
} from "antdv-next";
import {
  useCrud,
  type FormFieldsConfig,
  type ColumnsConfig,
  type FilterField,
} from "@/components/Crud";
import { createMockUsers, createMockUserApi, type MockUser } from "./mock";

// 创建 mock 数据和 API
const mockUsers = createMockUsers(20);
const userApi = createMockUserApi(mockUsers);

// 筛选字段配置
const filterFields: FilterField<MockUser>[] = [
  {
    formItem: { name: "name", label: "姓名" },
    component: { is: "AInput", placeholder: "请输入姓名" },
  },
];

// 表单字段配置
const formFields: FormFieldsConfig<MockUser> = [
  {
    formItem: { name: "name", label: "姓名", required: true },
    component: { is: "AInput" },
  },
  {
    formItem: { name: "email", label: "邮箱", required: true },
    component: { is: "AInput" },
  },
];

// 列配置
const columns: ColumnsConfig<MockUser> = ({ openEditForm, handleDelete }) => [
  { title: "ID", dataIndex: "id", width: 80 },
  { title: "姓名", dataIndex: "name" },
  { title: "邮箱", dataIndex: "email" },
  { title: "创建时间", dataIndex: "createTime", width: 120 },
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
const { loading, CrudComponent, refresh, openAddForm } = useCrud<MockUser>({
  api: userApi,
  filter: { fields: filterFields },
  form: { fields: formFields },
  table: {
    columns,
    loading: false, // 禁用内部表格 loading，由外部 ASpin 控制
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
</style>
