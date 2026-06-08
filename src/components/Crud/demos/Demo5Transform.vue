<template>
  <div class="demo-section">
    <h3>5. 参数转换</h3>
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
import {
  useCrud,
  type ColumnsConfig,
  type FilterField,
  type FormFieldsConfig,
} from "@/components/Crud";
import { createMockUsers, type MockUser } from "./mock";

// 创建 mock 数据
const mockUsers = createMockUsers(20);

// 模拟 API
const userApi = {
  list: async (params: Record<string, any>) => {
    console.log("请求参数:", params); // 查看转换后的参数
    await new Promise((r) => setTimeout(r, 300));
    const { page, pageSize } = params;
    const start = (page - 1) * pageSize;
    return {
      data: mockUsers.slice(start, start + pageSize),
      total: mockUsers.length,
    };
  },
  create: async (data: Partial<MockUser>) => {
    console.log("提交数据:", data); // 查看转换后的表单数据
    mockUsers.unshift({
      id: mockUsers.length + 1,
      name: data.name ?? "",
      email: data.email ?? "",
      status: "active",
      createTime: new Date().toLocaleDateString(),
    });
  },
};

// 筛选字段配置
const filterFields: FilterField<MockUser>[] = [
  { formItem: { name: "name", label: "姓名" }, component: { is: "AInput" } },
  {
    formItem: { name: "createTime", label: "创建时间" },
    component: { is: "AInput", type: "date" },
  },
];

// 表单字段配置
const formFields: FormFieldsConfig<MockUser> = [
  {
    formItem: { name: "name", label: "姓名", required: true },
    component: { is: "AInput" },
  },
  { formItem: { name: "email", label: "邮箱" }, component: { is: "AInput" } },
];

// 列配置
const columns: ColumnsConfig<MockUser> = [
  { title: "ID", dataIndex: "id", width: 80 },
  { title: "姓名", dataIndex: "name" },
  { title: "邮箱", dataIndex: "email" },
  { title: "创建时间", dataIndex: "createTime", width: 120 },
];

// 参数转换
const { CrudComponent, openAddForm } = useCrud<MockUser>({
  api: userApi,
  filter: {
    fields: filterFields,
    // 筛选参数转换：将参数转换为后端需要的格式
    transform: (params) => {
      const { page, pageSize, name, createTime } = params;
      const result: Record<string, any> = { page, pageSize };
      if (name) result.keyword = name;
      if (createTime) {
        result.startDate = createTime;
        result.endDate = createTime;
      }
      console.log("转换前:", params, "转换后:", result);
      return result;
    },
  },
  form: {
    fields: formFields,
    // 表单数据转换：提交前处理数据
    transform: (data, mode) => {
      console.log("表单转换:", mode, data);
      if (mode === "add") {
        return { ...data, status: "active" };
      }
      return data;
    },
  },
  table: { columns },
});
</script>

<style scoped>
.toolbar-buttons {
  display: flex;
  gap: 8px;
}
</style>
