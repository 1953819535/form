<template>
  <div class="demo-section">
    <h3>2. 禁用分页</h3>
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
import { Button as AButton } from "antdv-next";
import { useCrud, type ColumnsConfig } from "@/components/Crud";
import { createMockUsers, type MockUser } from "./mock";

// 创建 mock 数据
const mockUsers = createMockUsers(10);

// 简化 API（仅列表）
const userApi = {
  list: async () => {
    await new Promise((r) => setTimeout(r, 300));
    return { data: mockUsers, total: mockUsers.length };
  },
};

// 列配置
const columns: ColumnsConfig<MockUser> = [
  { title: "ID", dataIndex: "id", width: 80 },
  { title: "姓名", dataIndex: "name" },
  { title: "邮箱", dataIndex: "email" },
];

// 禁用分页
const { CrudComponent, openAddForm } = useCrud<MockUser>({
  api: userApi,
  table: { columns },
  pagination: false,
});
</script>

<style scoped>
.toolbar-buttons {
  display: flex;
  gap: 8px;
}
</style>
