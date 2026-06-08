<template>
  <div class="demo-section">
    <h3>4. 自定义错误处理</h3>
    <CrudComponent>
      <template #toolbarRight>
        <div class="toolbar-buttons">
          <AButton @click="refresh()">刷新</AButton>
          <AButton type="primary" @click="openAddForm()">新增</AButton>
        </div>
      </template>
    </CrudComponent>
  </div>
</template>

<script setup lang="tsx">
import { Button as AButton, message as AMessage } from "antdv-next";
import {
  useCrud,
  type ColumnsConfig,
  type FormFieldsConfig,
} from "@/components/Crud";
import { createMockUsers, type MockUser } from "./mock";

// 创建 mock 数据
const mockUsers = createMockUsers(10);

// 模拟 API（支持错误场景）
const userApi = {
  list: async (params: {
    page: number;
    pageSize: number;
    triggerError?: boolean;
  }) => {
    // 模拟错误场景
    if (params.triggerError) {
      throw new Error("模拟加载失败");
    }
    await new Promise((r) => setTimeout(r, 300));
    const { page, pageSize } = params;
    const start = (page - 1) * pageSize;
    return {
      data: mockUsers.slice(start, start + pageSize),
      total: mockUsers.length,
    };
  },
};

// 表单字段配置
const formFields: FormFieldsConfig<MockUser> = [
  {
    formItem: { name: "name", label: "姓名", required: true },
    component: { is: "AInput" },
  },
];

// 列配置
const columns: ColumnsConfig<MockUser> = [
  { title: "ID", dataIndex: "id", width: 80 },
  { title: "姓名", dataIndex: "name" },
  { title: "邮箱", dataIndex: "email" },
];

// 自定义错误处理
const { CrudComponent, refresh, openAddForm } = useCrud<MockUser>({
  api: userApi,
  form: { fields: formFields },
  table: { columns },
  error: {
    show: true,
    handler: (error, operation) => {
      console.error(`[${operation}]`, error);
      AMessage.error(`${operation} 失败: ${error.message}`);
    },
  },
});
</script>

<style scoped>
.toolbar-buttons {
  display: flex;
  gap: 8px;
}
</style>
