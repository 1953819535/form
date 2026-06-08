<script setup lang="ts">
definePage({
  meta: {
    title: "FilterForm 筛选",
    requiresAuth: true,
    order: 1, // 子菜单排序
  },
});

import { ref } from "vue";
import { message as AMessage } from "antdv-next";
import { FilterForm, type FilterField } from "@/components/FilterForm";

// ──────────────────────────────────────────────────────────────
// 示例 1: 基础用法（inline 布局 + 联动显示隐藏）
// ──────────────────────────────────────────────────────────────
interface FilterValues {
  keyword: string;
  status: string;
  type: "personal" | "business" | undefined;
  company: string;
}

const filterFields: FilterField<FilterValues>[] = [
  {
    formItem: { name: "keyword", label: "关键词" },
    component: { is: "AInput", placeholder: "请输入关键词" },
  },
  {
    formItem: { name: "status", label: "状态" },
    component: {
      is: "ASelect",
      placeholder: "请选择状态",
      options: [
        { value: "active", label: "启用" },
        { value: "inactive", label: "禁用" },
      ],
    },
  },
  {
    formItem: { name: "type", label: "类型" },
    component: {
      is: "ASelect",
      placeholder: "请选择类型",
      options: [
        { value: "personal", label: "个人" },
        { value: "business", label: "企业" },
      ],
    },
  },
  {
    formItem: { name: "company", label: "公司名称" },
    visible: (formData) => formData.type === "business",
    component: { is: "AInput", placeholder: "请输入公司名称" },
  },
];

const handleFilterSearch = (values: FilterValues) => {
  AMessage.success(`搜索: ${JSON.stringify(values)}`);
};

const handleFilterReset = (values: FilterValues) => {
  AMessage.info("已重置筛选条件");
};

// ──────────────────────────────────────────────────────────────
// 示例 2: 栅格布局 + 展开收起
// ──────────────────────────────────────────────────────────────
interface GridFilterValues {
  name: string;
  email: string;
  phone: string;
  department: string;
  status: string;
  createDate: string;
}

const gridFilterFields: FilterField<GridFilterValues>[] = [
  {
    formItem: { name: "name", label: "姓名" },
    component: { is: "AInput", placeholder: "请输入姓名" },
  },
  {
    formItem: { name: "email", label: "邮箱" },
    component: { is: "AInput", placeholder: "请输入邮箱" },
  },
  {
    formItem: { name: "phone", label: "电话" },
    component: { is: "AInput", placeholder: "请输入电话" },
  },
  {
    formItem: { name: "department", label: "部门" },
    component: {
      is: "ASelect",
      placeholder: "请选择部门",
      options: [
        { value: "tech", label: "技术部" },
        { value: "sales", label: "销售部" },
        { value: "hr", label: "人事部" },
      ],
    },
  },
  {
    formItem: { name: "status", label: "状态" },
    component: {
      is: "ASelect",
      placeholder: "请选择状态",
      options: [
        { value: "active", label: "在职" },
        { value: "inactive", label: "离职" },
      ],
    },
  },
  {
    formItem: { name: "createDate", label: "入职日期" },
    component: { is: "ADatePicker", placeholder: "选择日期" },
  },
];

const handleGridFilterSearch = (values: GridFilterValues) => {
  AMessage.success(`栅格搜索: ${JSON.stringify(values)}`);
};

const handleGridFilterReset = () => {
  AMessage.info("栅格筛选已重置");
};

// ──────────────────────────────────────────────────────────────
// 示例 3: 动态字段（函数形式）
// ──────────────────────────────────────────────────────────────
interface DynamicFilterValues {
  searchType: "user" | "order" | "product";
  keyword: string;
  userId: string;
  orderId: string;
  productId: string;
  dateRange: [string, string] | undefined;
}

const dynamicFilterFields = (
  formData: DynamicFilterValues,
): FilterField<DynamicFilterValues>[] => {
  const baseFields: FilterField<DynamicFilterValues>[] = [
    {
      formItem: { name: "searchType", label: "搜索类型" },
      component: {
        is: "ASelect",
        placeholder: "选择搜索类型",
        options: [
          { value: "user", label: "用户" },
          { value: "order", label: "订单" },
          { value: "product", label: "商品" },
        ],
      },
    },
  ];

  // 根据搜索类型动态添加字段
  if (formData.searchType === "user") {
    baseFields.push({
      formItem: { name: "userId", label: "用户ID" },
      component: { is: "AInput", placeholder: "请输入用户ID" },
    });
  } else if (formData.searchType === "order") {
    baseFields.push({
      formItem: { name: "orderId", label: "订单号" },
      component: { is: "AInput", placeholder: "请输入订单号" },
    });
  } else if (formData.searchType === "product") {
    baseFields.push({
      formItem: { name: "productId", label: "商品ID" },
      component: { is: "AInput", placeholder: "请输入商品ID" },
    });
  }

  baseFields.push({
    formItem: { name: "dateRange", label: "日期范围" },
    component: { is: "ARangePicker" },
  });

  return baseFields;
};

const handleDynamicFilterSearch = (values: DynamicFilterValues) => {
  AMessage.success(`动态搜索: ${JSON.stringify(values)}`);
};

// ──────────────────────────────────────────────────────────────
// 示例 4: 受控模式
// ──────────────────────────────────────────────────────────────
interface ControlledFilterValues {
  keyword: string;
  category: string;
}

const controlledFilterValues = ref<ControlledFilterValues>({
  keyword: "",
  category: "",
});

const controlledFilterFields: FilterField<ControlledFilterValues>[] = [
  {
    formItem: { name: "keyword", label: "关键词" },
    component: { is: "AInput", placeholder: "请输入关键词" },
  },
  {
    formItem: { name: "category", label: "分类" },
    component: {
      is: "ASelect",
      placeholder: "请选择分类",
      options: [
        { value: "cat1", label: "分类一" },
        { value: "cat2", label: "分类二" },
        { value: "cat3", label: "分类三" },
      ],
    },
  },
];

const handleControlledSearch = (values: ControlledFilterValues) => {
  AMessage.success(`受控搜索: ${JSON.stringify(values)}`);
};

// ──────────────────────────────────────────────────────────────
// 示例 5: 自定义操作按钮
// ──────────────────────────────────────────────────────────────
interface CustomActionsValues {
  name: string;
  code: string;
}

const customActionsFields: FilterField<CustomActionsValues>[] = [
  {
    formItem: { name: "name", label: "名称" },
    component: { is: "AInput", placeholder: "请输入名称" },
  },
  {
    formItem: { name: "code", label: "编码" },
    component: { is: "AInput", placeholder: "请输入编码" },
  },
];

const customFilterRef = ref<Record<string, any>>({});

const handleCustomSearch = () => {
  AMessage.success(`自定义搜索: ${JSON.stringify(customFilterRef.value)}`);
};

const handleCustomExport = () => {
  AMessage.info("导出数据...");
};
</script>

<template>
  <div class="page-container">
    <h2>FilterForm 筛选组件示例</h2>

    <!-- 1. 基础用法 -->
    <div class="demo-section">
      <h3>1. 基础用法（inline 布局 + 联动显示隐藏）</h3>
      <FilterForm
        :fields="filterFields"
        @search="handleFilterSearch"
        @reset="handleFilterReset"
        :on-auto-search="handleFilterSearch"
      />
    </div>

    <!-- 2. 栅格布局 + 展开收起 -->
    <div class="demo-section">
      <h3>2. 栅格布局 + 展开收起</h3>
      <FilterForm
        :fields="gridFilterFields"
        layout="grid"
        :columns="4"
        :collapsed="true"
        :default-collapse-count="4"
        @search="handleGridFilterSearch"
        @reset="handleGridFilterReset"
      />
    </div>

    <!-- 3. 动态字段（函数形式） -->
    <div class="demo-section">
      <h3>3. 动态字段（函数形式）</h3>
      <FilterForm
        :fields="dynamicFilterFields"
        :initial-values="{ searchType: 'user' }"
        @search="handleDynamicFilterSearch"
      />
    </div>

    <!-- 4. 受控模式 -->
    <div class="demo-section">
      <h3>4. 受控模式（v-model）</h3>
      <FilterForm
        v-model="controlledFilterValues"
        :fields="controlledFilterFields"
        @search="handleControlledSearch"
      />
      <div style="margin-top: 8px; color: #666">
        当前值: {{ JSON.stringify(controlledFilterValues) }}
      </div>
    </div>

    <!-- 5. 自定义操作按钮 -->
    <div class="demo-section">
      <h3>5. 自定义操作按钮</h3>
      <FilterForm
        v-model="customFilterRef"
        :fields="customActionsFields"
        :show-search-button="false"
        :show-reset-button="false"
      >
        <template #actions>
          <AButton type="primary" @click="handleCustomSearch">查询</AButton>
          <AButton @click="() => (customFilterRef = {})">重置</AButton>
          <AButton @click="handleCustomExport">导出</AButton>
        </template>
      </FilterForm>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 1200px;
}

.page-container h2 {
  margin-bottom: 24px;
}

.demo-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
}

.demo-section h3 {
  margin-bottom: 12px;
  color: #333;
}
</style>