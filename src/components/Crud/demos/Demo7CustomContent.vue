<template>
  <div class="demo-section">
    <h3>7. 自定义渲染（content 插槽覆盖表格）</h3>
    <CrudComponent>
      <template #toolbarRight>
        <div class="toolbar-buttons">
          <AButton type="primary" @click="openAddForm()">新增</AButton>
        </div>
      </template>

      <!-- 使用 content 插槽自定义渲染 -->
      <template #content="{ dataSource, loading, openEditForm, handleDelete }">
        <ASpin :spinning="loading">
          <div class="custom-grid">
            <ACard
              v-for="item in dataSource"
              :key="item.id"
              class="custom-card"
              size="small"
              :hoverable="true"
            >
              <template #title>
                <div class="card-header">
                  <ATag :color="item.status === 'active' ? 'green' : 'default'">
                    {{ item.status === "active" ? "启用" : "禁用" }}
                  </ATag>
                  <span class="card-title">{{ item.name }}</span>
                </div>
              </template>
              <template #extra>
                <ASpace size="small">
                  <AButton type="link" size="small" @click="openEditForm(item)">
                    编辑
                  </AButton>
                  <APopconfirm
                    title="确认删除？"
                    @confirm="handleDelete(item.id)"
                  >
                    <AButton type="link" size="small" danger> 删除 </AButton>
                  </APopconfirm>
                </ASpace>
              </template>

              <div class="card-content">
                <div class="info-row">
                  <span class="label">ID:</span>
                  <span>{{ item.id }}</span>
                </div>
                <div class="info-row">
                  <span class="label">邮箱:</span>
                  <span>{{ item.email }}</span>
                </div>
                <div class="info-row">
                  <span class="label">创建时间:</span>
                  <span>{{ item.createTime }}</span>
                </div>
              </div>
            </ACard>
          </div>

          <AEmpty v-if="dataSource.length === 0" description="暂无数据" />
        </ASpin>
      </template>
    </CrudComponent>
  </div>
</template>

<script setup lang="tsx">
import {
  Button as AButton,
  Card as ACard,
  Spin as ASpin,
  Tag as ATag,
  Space as ASpace,
  Empty as AEmpty,
  Popconfirm as APopconfirm,
} from "antdv-next";
import { useCrud, type FormFieldsConfig } from "@/components/Crud";
import { createMockUsers, createMockUserApi, type MockUser } from "./mock";

// 创建 mock 数据和 API
const mockUsers = createMockUsers(12);
const userApi = createMockUserApi(mockUsers);

// 表单字段配置
const formFields: FormFieldsConfig<MockUser> = [
  {
    formItem: { name: "name", label: "姓名", required: true },
    component: { is: "AInput" },
  },
  { formItem: { name: "email", label: "邮箱" }, component: { is: "AInput" } },
];

// useCrud 配置
const { CrudComponent, openAddForm } = useCrud<MockUser>({
  api: userApi,
  form: { fields: formFields },
  table: {
    columns: [], // 使用 content 插槽时，columns 可以为空
    loading: false, // 禁用内部 loading，由插槽控制
  },
  pagination: {
    pageSize: 12, // 卡片布局适合 12 条每页
  },
});
</script>

<style scoped>
.toolbar-buttons {
  display: flex;
  gap: 8px;
}

.custom-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.custom-card {
  transition: all 0.3s;
}

.custom-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  font-weight: 500;
}

.card-content {
  padding: 8px 0;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
  font-size: 13px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  width: 70px;
  color: #999;
}
</style>
