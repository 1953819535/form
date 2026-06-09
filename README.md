# createForm

Vue3 后台系统快速开发模板，基于 Composition API 构建的 CRUD 组件库与命令式表单弹窗解决方案。

## 特性

- 🚀 **快速开发** - 开箱即用的 CRUD 组件，几行代码即可完成增删改查页面
- 📦 **命令式表单** - 支持 Modal/Drawer 两种弹窗形式的命令式调用
- 🔧 **高度可配置** - 筛选、表格、分页、表单均可灵活配置
- 💪 **TypeScript** - 完整的类型支持，提供良好的开发体验
- 🎨 **Tailwind CSS** - 使用 Tailwind CSS 4 进行样式管理
- 📁 **文件路由** - 基于 vite-plugin-vue-layouts 的约定式路由

## 技术栈

- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vue Router](https://router.vuejs.org/) - 官方路由管理器
- [antdv-next](https://antdv-next.com/) - Ant Design Vue 组件库
- [Tailwind CSS 4](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集

## 快速开始

### 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`

### 安装

```bash
pnpm install
```

### 开发

```bash
pnpm dev
```

### 构建

```bash
pnpm build
```

## 核心模块

### 1. useCrud 组合式函数

快速构建 CRUD 页面的核心功能。

```typescript
import { useCrud } from '@/components/Crud'

const { loading, CrudComponent, refresh, openAddForm, openEditForm } = useCrud({
  // API 配置（必填）
  api: {
    list: (params) => fetchList(params),
    create: (data) => createItem(data),
    update: (id, data) => updateItem(id, data),
    delete: (id) => deleteItem(id),
  },
  // 筛选配置
  filter: {
    fields: [
      { formItem: { name: 'name', label: '姓名' }, component: { is: 'AInput' } }
    ]
  },
  // 表单配置
  form: {
    fields: [
      { formItem: { name: 'name', label: '姓名', required: true }, component: { is: 'AInput' } }
    ]
  },
  // 表格配置
  table: {
    columns: [
      { title: '姓名', dataIndex: 'name' },
      { title: '操作', key: 'action' }
    ]
  }
})
```

在模板中使用：

```vue
<template>
  <CrudComponent>
    <template #toolbarRight>
      <AButton type="primary" @click="openAddForm()">新增</AButton>
    </template>
  </CrudComponent>
</template>
```

### 2. createFormModal / createFormDrawer

命令式创建表单弹窗，适用于需要手动触发的表单场景。

```typescript
import { createFormModal, createFormDrawer } from '@/utils/form'

// Modal 表单
const result = await createFormModal({
  model: { title: '新增用户' },
  fields: [
    { formItem: { name: 'name', label: '姓名' }, component: { is: 'AInput' } },
    { formItem: { name: 'email', label: '邮箱' }, component: { is: 'AInput' } }
  ],
  onSubmit: async (formData) => {
    await createUser(formData)
  }
})

// Drawer 表单
const result = await createFormDrawer({
  drawer: { title: '编辑用户', width: 500 },
  fields: [...],
  onSubmit: async (formData) => {
    await updateUser(formData)
  }
})
```

### 3. FilterForm 筛选表单

独立的筛选表单组件，支持折叠展开。

```vue
<template>
  <FilterForm
    :fields="filterFields"
    :collapsed="true"
    :default-collapse-count="3"
    @search="handleSearch"
    @reset="handleReset"
  />
</template>

<script setup>
const filterFields = [
  { formItem: { name: 'name', label: '姓名' }, component: { is: 'AInput' } },
  { formItem: { name: 'status', label: '状态' }, component: { is: 'ASelect', options: [...] } }
]
</script>
```

## 目录结构

```
src/
├── components/           # 组件目录
│   ├── Crud/            # CRUD 组件
│   │   ├── composables/ # 子组合式函数
│   │   ├── demos/       # 示例页面
│   │   ├── types/       # 类型定义
│   │   ├── CrudComponent.vue
│   │   └── useCrud.ts
│   ├── FilterForm/      # 筛选表单组件
│   ├── Sidebar.vue      # 侧边栏
│   └── SidebarItem.vue
├── utils/
│   └── form/            # 表单工具
│       ├── createFormModal.ts
│       ├── createFormDrawer.ts
│       ├── renderForm.ts
│       └── types.ts
├── layouts/             # 布局组件
│   ├── default.vue      # 默认布局
│   └── blank.vue        # 空白布局
├── pages/               # 页面（文件路由）
│   ├── demo/            # 示例页面
│   └── ...
├── router.ts            # 路由配置
└── main.ts              # 入口文件
```

## 配置说明

### useCrud 配置项

| 参数 | 说明 | 类型 | 必填 |
|------|------|------|------|
| `api` | API 接口配置 | `CrudApi<T>` | ✅ |
| `filter` | 筛选配置 | `CrudFilterConfig<T>` | - |
| `form` | 表单配置 | `CrudFormConfig<T>` | - |
| `table` | 表格配置 | `CrudTableConfig<T>` | - |
| `pagination` | 分页配置 | `CrudPaginationConfig \| false` | - |
| `error` | 错误处理配置 | `CrudErrorConfig \| false` | - |
| `on` | 事件回调 | `CrudEventCallbacks<T>` | - |

### API 接口定义

```typescript
interface CrudApi<T> {
  list: (params: ListParams) => Promise<{ data: T[]; total: number }>
  create: (data: Partial<T>) => Promise<T>
  update: (id: any, data: Partial<T>) => Promise<T>
  delete: (id: any) => Promise<void>
}
```

## 布局与路由

项目使用文件路由系统：

- `src/pages/` 下的 `.vue` 文件自动生成路由
- `src/layouts/` 定义布局组件
- 使用 `definePage` 宏自定义路由元信息

```vue
<!-- pages/user/index.vue -->
<script setup>
definePage({
  meta: { title: '用户管理' }
})
</script>
```

## 示例

查看 `src/pages/demo/` 目录下的示例页面：

- **filter-form.vue** - 筛选表单示例
- **modal-form.vue** - Modal 表单示例
- **drawer-form.vue** - Drawer 表单示例
- **crud.vue** - 完整 CRUD 示例

## 脚本命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm preview` | 预览构建结果 |
| `pnpm type-check` | 类型检查 |
| `pnpm format` | 代码格式化 |

## 开发环境推荐

- [VS Code](https://code.visualstudio.com/)
- [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 扩展（禁用 Vetur）
- 浏览器安装 [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)

## License

MIT
