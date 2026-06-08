# Crud 组件

配置式的 CRUD 组件，基于 Vue 3 Composition API 实现。

## 安装

```bash
pnpm add antdv-next
```

## 基本用法

```vue
<script setup lang="tsx">
import { useCrud, type ColumnsConfig, type FormFieldsConfig } from '@/components/Crud'

// 定义数据类型
interface User {
  id: number
  name: string
  email: string
  status: 'active' | 'inactive'
}

// 定义 API
const userApi = {
  list: async (params) => {
    const res = await fetch('/api/users', { params })
    return { data: res.data, total: res.total }
  },
  create: async (data) => {
    await fetch('/api/users', { method: 'POST', body: data })
  },
  update: async (id, data) => {
    await fetch(`/api/users/${id}`, { method: 'PUT', body: data })
  },
  delete: async (id) => {
    await fetch(`/api/users/${id}`, { method: 'DELETE' })
  },
}

// 表单字段配置
const formFields: FormFieldsConfig<User> = [
  { formItem: { name: 'name', label: '姓名', required: true }, component: { is: 'AInput' } },
  { formItem: { name: 'email', label: '邮箱', required: true }, component: { is: 'AInput' } },
]

// 列配置（支持 JSX 渲染）
const columns: ColumnsConfig<User> = ({ openEditForm, handleDelete }) => [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '姓名', dataIndex: 'name' },
  { title: '邮箱', dataIndex: 'email' },
  {
    title: '操作',
    key: 'action',
    width: 150,
    render: (_, record) => (
      <div>
        <AButton type="link" size="small" onClick={() => openEditForm(record)}>
          编辑
        </AButton>
        <APopconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
          <AButton type="link" size="small" danger>
            删除
          </AButton>
        </APopconfirm>
      </div>
    ),
  },
]

// 使用 useCrud
const { loading, CrudComponent, refresh, openAddForm } = useCrud<User>({
  api: userApi,
  form: { fields: formFields },
  table: { columns },
})
</script>

<template>
  <div>
    <AButton type="primary" @click="openAddForm()">新增</AButton>
    <AButton @click="refresh()">刷新</AButton>
    <CrudComponent />
  </div>
</template>
```

## API

### useCrud(options)

#### 参数

| 参数         | 类型                            | 必填 | 说明                       |
| ------------ | ------------------------------- | ---- | -------------------------- |
| `api`        | `CrudApi<T>`                    | 是   | API 配置                   |
| `filter`     | `CrudFilterConfig<T>`           | 否   | 筛选配置                   |
| `form`       | `CrudFormConfig<T>`             | 否   | 表单配置                   |
| `table`      | `CrudTableConfig<T>`            | 否   | 表格配置                   |
| `pagination` | `CrudPaginationConfig \| false` | 否   | 分页配置，`false` 禁用     |
| `error`      | `CrudErrorConfig \| false`      | 否   | 错误处理配置，`false` 禁用 |
| `on`         | `CrudEventCallbacks<T>`         | 否   | 事件回调                   |

#### 返回值

| 属性            | 类型                         | 说明         |
| --------------- | ---------------------------- | ------------ |
| `loading`       | `Ref<boolean>`               | 加载状态     |
| `dataSource`    | `Ref<T[]>`                   | 数据列表     |
| `selectedRows`  | `Ref<T[]>`                   | 选中的行     |
| `pagination`    | `Ref<PaginationState>`       | 分页状态     |
| `refresh`       | `() => Promise<void>`        | 刷新数据     |
| `handleDelete`  | `(id: any) => Promise<void>` | 删除数据     |
| `openAddForm`   | `() => void`                 | 打开新增表单 |
| `openEditForm`  | `(record: T) => void`        | 打开编辑表单 |
| `CrudComponent` | `Component`                  | CRUD 组件    |

---

### CrudApi

```typescript
interface CrudApi<T> {
  list: (params: { page: number; pageSize: number; [key: string]: any }) => Promise<{
    data: T[]
    total: number
  }>
  create?: (data: Partial<T>) => Promise<void>
  update?: (id: any, data: Partial<T>) => Promise<void>
  delete?: (id: any) => Promise<void>
}
```

---

### CrudFilterConfig

| 属性            | 类型                    | 默认值 | 说明               |
| --------------- | ----------------------- | ------ | ------------------ |
| `fields`        | `FilterFieldsConfig<T>` | -      | 筛选字段配置       |
| `collapsed`     | `boolean`               | `true` | 是否折叠           |
| `collapseCount` | `number`                | `3`    | 折叠时显示的字段数 |
| `transform`     | `TransformParams`       | -      | 参数转换函数       |

---

### CrudFormConfig

| 属性        | 类型                    | 默认值    | 说明         |
| ----------- | ----------------------- | --------- | ------------ |
| `fields`    | `FormFieldsConfig<T>`   | -         | 表单字段配置 |
| `type`      | `"modal" \| "drawer"`   | `"modal"` | 弹窗类型     |
| `props`     | `Record<string, any>`   | -         | 弹窗属性     |
| `rules`     | `Record<string, any[]>` | -         | 表单校验规则 |
| `transform` | `TransformFormData<T>`  | -         | 表单数据转换 |

---

### CrudTableConfig

| 属性        | 类型                                | 默认值   | 说明                 |
| ----------- | ----------------------------------- | -------- | -------------------- |
| `columns`   | `ColumnsConfig<T>`                  | -        | 列配置（Ant Design） |
| `rowKey`    | `string \| ((record: T) => string)` | `"id"`   | 行 key               |
| `selection` | `"none" \| "single" \| "multiple"`  | `"none"` | 选择模式             |
| `props`     | `Record<string, any>`               | -        | 表格属性透传         |
| `loading`   | `boolean`                           | `true`   | 是否显示内部 loading |

---

### CrudPaginationConfig

| 属性              | 类型       | 默认值              | 说明         |
| ----------------- | ---------- | ------------------- | ------------ |
| `enabled`         | `boolean`  | `true`              | 是否启用分页 |
| `pageSize`        | `number`   | `10`                | 每页条数     |
| `pageSizeOptions` | `number[]` | `[10, 20, 50, 100]` | 每页条数选项 |

---

### CrudErrorConfig

| 属性      | 类型                                                | 默认值 | 说明             |
| --------- | --------------------------------------------------- | ------ | ---------------- |
| `show`    | `boolean`                                           | `true` | 是否显示错误提示 |
| `handler` | `(error: Error, operation: CRUD_OPERATION) => void` | -      | 自定义错误处理   |

---

### CrudEventCallbacks

| 属性              | 类型                                       | 说明         |
| ----------------- | ------------------------------------------ | ------------ |
| `listSuccess`     | `(data: T[], total: number) => void`       | 列表加载成功 |
| `listError`       | `(error: Error) => void`                   | 列表加载失败 |
| `createSuccess`   | `(data: T) => void`                        | 新增成功     |
| `updateSuccess`   | `(data: T) => void`                        | 更新成功     |
| `deleteSuccess`   | `(id: any) => void`                        | 删除成功     |
| `selectionChange` | `(selectedRows: T[]) => void`              | 选择变化     |
| `pageChange`      | `(page: number, pageSize: number) => void` | 分页变化     |

---

## 插槽

### CrudComponent 插槽

| 插槽名         | 说明                           | 数据来源         |
| -------------- | ------------------------------ | ---------------- |
| `filter`       | 自定义筛选区域                 | -                |
| `toolbarLeft`  | 操作栏左侧（批量操作、多选等） | `useCrud` 返回值 |
| `toolbarRight` | 操作栏右侧（新增、刷新等）     | `useCrud` 返回值 |
| `content`      | 自定义内容区域                 | 插槽 props       |
| `pagination`   | 自定义分页区域                 | -                |
| `empty`        | 空数据提示                     | -                |

### 插槽使用示例

```vue
<script setup lang="ts">
const { loading, selectedRows, CrudComponent, refresh, openAddForm } = useCrud({
  api: userApi,
  table: { columns, selection: 'multiple' },
})

// 批量删除处理
const handleBatchDelete = (rows: User[]) => {
  const ids = rows.map((row) => row.id)
  // 批量删除逻辑...
}
</script>

<template>
  <CrudComponent>
    <!-- 左侧工具栏：批量操作 -->
    <template #toolbarLeft>
      <AButton :disabled="selectedRows.length === 0" @click="handleBatchDelete(selectedRows)">
        批量删除 ({{ selectedRows.length }})
      </AButton>
    </template>

    <!-- 右侧工具栏：常规操作 -->
    <template #toolbarRight>
      <AButton @click="refresh()">刷新</AButton>
      <AButton type="primary" @click="openAddForm()">新增</AButton>
    </template>
  </CrudComponent>
</template>
```

> **注意**：插槽中使用的数据和方法（如 `selectedRows`、`refresh`、`openAddForm`）来自 `useCrud` 的返回值，而非插槽参数。

---

## 高级用法

### 禁用分页

```typescript
useCrud({
  api: userApi,
  table: { columns },
  pagination: false, // 禁用分页
})
```

### 使用 Drawer 表单

```typescript
useCrud({
  api: userApi,
  form: {
    fields: formFields,
    type: 'drawer', // 使用 Drawer 弹窗
  },
  table: { columns },
})
```

### 多选模式

```typescript
const { selectedRows } = useCrud({
  api: userApi,
  table: {
    columns,
    selection: 'multiple', // 多选模式
  },
})

// 批量操作
const handleBatchDelete = () => {
  const ids = selectedRows.value.map((row) => row.id)
  // ...
}
```

### 参数转换

```typescript
useCrud({
  api: userApi,
  filter: {
    fields: filterFields,
    // 筛选参数转换
    transform: (params) => {
      const { name, ...rest } = params
      return {
        ...rest,
        keyword: name, // 将 name 转换为 keyword
      }
    },
  },
  form: {
    fields: formFields,
    // 表单数据转换
    transform: (data, mode) => {
      if (mode === 'add') {
        return { ...data, status: 'active' }
      }
      return data
    },
  },
})
```

### 自定义错误处理

```typescript
useCrud({
  api: userApi,
  table: { columns },
  error: {
    show: true,
    handler: (error, operation) => {
      console.error(`[${operation}]`, error)
      // 自定义错误提示
    },
  },
})
```

### 外部控制 Loading

```vue
<script setup>
const { loading, CrudComponent } = useCrud({
  api: userApi,
  table: {
    columns,
    loading: false, // 禁用内部 loading
  },
})
</script>

<template>
  <ASpin :spinning="loading">
    <CrudComponent />
  </ASpin>
</template>
```

### 表格 Props 透传

通过 `table.props` 可以透传 Ant Design Table 的原生属性，实现边框、尺寸、斑马纹等自定义样式：

```vue
<script setup lang="ts">
const { CrudComponent } = useCrud({
  api: userApi,
  table: {
    columns,
    // 透传 Ant Design Table 原生属性
    props: {
      bordered: true, // 显示边框
      size: 'middle', // 中等行高
      rowClassName: (
        _,
        index, // 斑马纹
      ) => (index % 2 === 1 ? 'table-row-striped' : ''),
    },
  },
})
</script>

<template>
  <CrudComponent />
</template>

<style scoped>
:deep(.table-row-striped) {
  background-color: #fafafa;
}
</style>
```

支持的 `table.props` 包括：

- `bordered` - 是否显示边框
- `size` - 表格大小 (`'small' | 'middle' | 'large'`)
- `rowClassName` - 行样式类名
- `scroll` - 滚动配置
- `expandable` - 展开行配置
- 其他 Ant Design Table 支持的属性...

---

## 示例列表

| 示例                   | 说明                                       |
| ---------------------- | ------------------------------------------ |
| Demo1Basic             | 基础用法：筛选 + 表单 + 表格 + 分页       |
| Demo2NoPagination      | 禁用分页                                   |
| Demo3DrawerMultiSelect | Drawer 表单 + 多选 + 工具栏插槽            |
| Demo4CustomError       | 自定义错误处理                             |
| Demo5Transform         | 参数转换（筛选 + 表单）                    |
| Demo6TableProps        | 表格 Props 透传（边框、尺寸、斑马纹）      |
| Demo7CustomContent     | 自定义渲染（content 插槽覆盖表格）         |

---

## 自定义渲染

通过 `content` 插槽可以完全覆盖表格渲染，实现卡片布局、列表视图等自定义展示：

```vue
<template>
  <CrudComponent>
    <template #content="{ dataSource, loading, openEditForm, handleDelete }">
      <ASpin :spinning="loading">
        <!-- 卡片网格布局 -->
        <div class="custom-grid">
          <ACard v-for="item in dataSource" :key="item.id">
            <template #title>
              <span>{{ item.name }}</span>
            </template>
            <template #extra>
              <AButton type="link" @click="openEditForm(item)">编辑</AButton>
              <AButton type="link" danger @click="handleDelete(item.id)">删除</AButton>
            </template>
            <!-- 卡片内容 -->
          </ACard>
        </div>
      </ASpin>
    </template>
  </CrudComponent>
</template>
```

**插槽参数**：

| 参数            | 类型                         | 说明             |
| --------------- | ---------------------------- | ---------------- |
| `dataSource`    | `T[]`                        | 当前数据列表     |
| `loading`       | `boolean`                    | 加载状态         |
| `openEditForm`  | `(record: T) => void`        | 打开编辑表单     |
| `handleDelete`  | `(id: any) => Promise<void>` | 删除数据         |
| `refresh`       | `() => Promise<void>`        | 刷新数据         |

---

## 列配置

### 基础列

```typescript
const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '姓名', dataIndex: 'name' },
]
```

### 函数形式（获取操作方法）

```typescript
const columns: ColumnsConfig<User> = ({ openEditForm, handleDelete, refresh }) => [
  { title: "ID", dataIndex: "id" },
  {
    title: "操作",
    key: "action",
    render: (_, record) => (
      <div>
        <AButton type="link" onClick={() => openEditForm(record)}>编辑</AButton>
        <APopconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
          <AButton type="link" danger>删除</AButton>
        </APopconfirm>
      </div>
    ),
  },
];
```

---

## 注意事项

1. **JSX 组件名**：在 JSX 中使用 Ant Design 组件时，需使用 PascalCase 命名并导入：

   ```tsx
   import { Button as AButton, Popconfirm as APopconfirm } from "antdv-next";

   // 使用
   <AButton type="link">编辑</AButton>
   <APopconfirm title="确认删除？">...</APopconfirm>
   ```

2. **类型安全**：建议为数据定义明确的 TypeScript 接口。

3. **插槽传递**：当使用 `<CrudComponent>` 的插槽时，数据和方法从 `useCrud` 返回值获取，而非插槽参数。
