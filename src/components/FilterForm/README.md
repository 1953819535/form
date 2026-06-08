# FilterForm 组件

配置式的筛选表单组件，基于 Vue 3 Composition API 实现，支持多种布局模式、展开收起、动态字段、自动搜索等功能。

## 安装

```bash
pnpm add antdv-next
```

## 基本用法

```vue
<script setup lang="ts">
import { FilterForm, type FilterField } from '@/components/FilterForm'

interface FilterValues {
  keyword: string
  status: string
}

const filterFields: FilterField<FilterValues>[] = [
  {
    formItem: { name: 'keyword', label: '关键词' },
    component: { is: 'AInput', placeholder: '请输入关键词' },
  },
  {
    formItem: { name: 'status', label: '状态' },
    component: {
      is: 'ASelect',
      placeholder: '请选择状态',
      options: [
        { value: 'active', label: '启用' },
        { value: 'inactive', label: '禁用' },
      ],
    },
  },
]

const handleSearch = (values: FilterValues) => {
  console.log('搜索:', values)
}
</script>

<template>
  <FilterForm :fields="filterFields" @search="handleSearch" />
</template>
```

## API

### Props

| 属性                   | 类型                                       | 默认值     | 说明                           |
| ---------------------- | ------------------------------------------ | ---------- | ------------------------------ |
| `fields`               | `FilterField<T>[] \| ((formData: T) => FilterField<T>[])` | -          | 字段配置，支持函数形式动态生成 |
| `modelValue`           | `T`                                        | -          | 表单数据（受控模式）           |
| `initialValues`        | `Partial<T>`                               | -          | 初始值                         |
| `loading`              | `boolean`                                  | -          | 加载状态                       |
| `layout`               | `'inline' \| 'grid'`                       | `'inline'` | 布局模式                       |
| `columns`              | `number`                                   | `4`        | 栅格布局列数（grid 模式）      |
| `rowGutter`            | `number`                                   | `16`       | 行间距（grid 模式）            |
| `colGutter`            | `number`                                   | `16`       | 列间距（grid 模式）            |
| `collapsed`            | `boolean`                                  | `true`     | 是否折叠                       |
| `defaultCollapseCount` | `number`                                   | `3`        | 折叠时显示的字段数             |
| `showCollapseButton`   | `boolean`                                  | `true`     | 是否显示展开收起按钮           |
| `showSearchButton`     | `boolean`                                  | `true`     | 是否显示搜索按钮               |
| `showResetButton`      | `boolean`                                  | `true`     | 是否显示重置按钮               |
| `searchButtonText`     | `string`                                   | `'搜索'`   | 搜索按钮文本                   |
| `resetButtonText`      | `string`                                   | `'重置'`   | 重置按钮文本                   |
| `buttonColSpan`        | `number`                                   | -          | 操作按钮占用的栅格数（grid 模式）|
| `onAutoSearch`         | `(formData: T) => void`                    | -          | 自动搜索回调函数               |

---

### Events

| 事件名            | 参数              | 说明                         |
| ----------------- | ----------------- | ---------------------------- |
| `update:modelValue` | `(value: T)`    | 表单数据变化时触发（受控模式）|
| `search`          | `(value: T)`      | 点击搜索按钮时触发           |
| `reset`           | `(value: T)`      | 点击重置按钮时触发           |
| `collapseChange`  | `(collapsed: boolean)` | 展开/收起状态变化时触发 |

---

### FilterField 类型

`FilterField` 复用了 `FormField` 类型，支持完整的字段配置：

```typescript
interface FormField<T extends Record<string, any> = Record<string, any>> {
  formItem: FormItemConfigExt & { name: keyof T & string }
  component: ComponentConfig<T>
  visible?: boolean | ((formData: T) => boolean)
  col?: any
}
```

#### formItem 配置

| 属性      | 类型                              | 说明                       |
| --------- | --------------------------------- | -------------------------- |
| `name`    | `keyof T & string`                | 字段名（必填）             |
| `label`   | `string`                          | 标签文本                   |
| `required`| `boolean`                         | 是否必填                   |
| `rules`   | `Rule[]`                          | 校验规则                   |
| `slots`   | `Record<string, SlotRender>`      | FormItem 插槽              |
| ...       | Ant Design FormItem 其他属性      |                            |

#### component 配置

| 属性            | 类型                                | 说明                                       |
| --------------- | ----------------------------------- | ------------------------------------------ |
| `is`            | `Component \| string`               | 组件标识（必填），如 `'AInput'`、`'ASelect'` |
| `modelPropName` | `string`                            | 双向绑定属性名，默认 `'value'`             |
| `trigger`       | `'immediate' \| 'enter'`            | 自动搜索触发时机                           |
| `models`        | `{ [prop: string]: keyof T }`       | 多重双向绑定                               |
| `slots`         | `Record<string, SlotRender>`        | 组件插槽                                   |
| ...             | 组件其他属性                        | 直接透传给组件                             |

#### visible 配置

| 类型                                 | 说明                       |
| ------------------------------------ | -------------------------- |
| `boolean`                            | 静态显示/隐藏              |
| `(formData: T) => boolean`           | 根据表单数据动态显示/隐藏  |

---

## 布局模式

### inline 布局（默认）

表单项水平排列，适合字段较少的场景：

```vue
<template>
  <FilterForm :fields="filterFields" layout="inline" />
</template>
```

### grid 布局

表单项按栅格排列，适合字段较多的场景：

```vue
<template>
  <FilterForm
    :fields="filterFields"
    layout="grid"
    :columns="4"
    :row-gutter="16"
    :col-gutter="16"
  />
</template>
```

栅格布局参数说明：

- `columns`: 每行显示几列（默认 4 列）
- `rowGutter`: 行间距（默认 16px）
- `colGutter`: 列间距（默认 16px）
- `buttonColSpan`: 操作按钮区域占用的栅格数

---

## 展开收起功能

当字段数量超过 `defaultCollapseCount` 时，自动显示展开收起按钮：

```vue
<template>
  <FilterForm
    :fields="manyFields"
    layout="grid"
    :columns="4"
    :collapsed="true"
    :default-collapse-count="4"
  />
</template>
```

参数说明：

- `collapsed`: 初始是否折叠（默认 `true`）
- `defaultCollapseCount`: 折叠时显示几个字段（默认 3）
- `showCollapseButton`: 是否显示展开收起按钮（默认 `true`）

监听展开收起状态：

```vue
<template>
  <FilterForm
    :fields="fields"
    @collapse-change="(collapsed) => console.log('折叠状态:', collapsed)"
  />
</template>
```

---

## 动态字段（函数形式）

`fields` 支持函数形式，根据当前表单数据动态生成字段列表：

```vue
<script setup lang="ts">
interface DynamicFilterValues {
  searchType: 'user' | 'order' | 'product'
  keyword: string
  userId: string
  orderId: string
  productId: string
}

const dynamicFilterFields = (formData: DynamicFilterValues): FilterField<DynamicFilterValues>[] => {
  const baseFields: FilterField<DynamicFilterValues>[] = [
    {
      formItem: { name: 'searchType', label: '搜索类型' },
      component: {
        is: 'ASelect',
        options: [
          { value: 'user', label: '用户' },
          { value: 'order', label: '订单' },
          { value: 'product', label: '商品' },
        ],
      },
    },
  ]

  // 根据搜索类型动态添加字段
  if (formData.searchType === 'user') {
    baseFields.push({
      formItem: { name: 'userId', label: '用户ID' },
      component: { is: 'AInput', placeholder: '请输入用户ID' },
    })
  } else if (formData.searchType === 'order') {
    baseFields.push({
      formItem: { name: 'orderId', label: '订单号' },
      component: { is: 'AInput', placeholder: '请输入订单号' },
    })
  }

  return baseFields
}
</script>

<template>
  <FilterForm :fields="dynamicFilterFields" @search="handleSearch" />
</template>
```

---

## 受控模式

通过 `v-model` 实现表单数据的双向绑定：

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface FilterValues {
  keyword: string
  category: string
}

const filterValues = ref<FilterValues>({
  keyword: '',
  category: '',
})

const filterFields: FilterField<FilterValues>[] = [
  { formItem: { name: 'keyword', label: '关键词' }, component: { is: 'AInput' } },
  { formItem: { name: 'category', label: '分类' }, component: { is: 'ASelect', options: [...] } },
]
</script>

<template>
  <FilterForm v-model="filterValues" :fields="filterFields" @search="handleSearch" />
  <div>当前筛选值: {{ JSON.stringify(filterValues) }}</div>
</template>
```

---

## 自动搜索功能

通过 `onAutoSearch` 实现字段值变化时自动触发搜索，无需点击搜索按钮。

### 基本用法

```vue
<script setup lang="ts">
const handleAutoSearch = (formData: any) => {
  console.log('自动搜索:', formData)
  // 执行搜索请求...
}
</script>

<template>
  <FilterForm
    :fields="filterFields"
    :on-auto-search="handleAutoSearch"
  />
</template>
```

### 触发时机（trigger）

组件会根据字段类型自动选择合适的触发时机，也可以通过 `trigger` 属性手动指定：

| trigger 值  | 说明                         | 默认适用组件                                       |
| ----------- | ---------------------------- | -------------------------------------------------- |
| `'immediate'` | 值变化时立即触发搜索         | `ASelect`、`ADatePicker`、`ARangePicker`、`ACheckbox`、`ASwitch`、`ARadioGroup` |
| `'enter'`     | 按下回车键时触发搜索         | `AInput`、`AInputNumber`、`ATextarea`              |

### 自定义触发时机

```vue
<script setup lang="ts">
const filterFields: FilterField[] = [
  {
    formItem: { name: 'keyword', label: '关键词' },
    component: {
      is: 'AInput',
      // 输入框默认是 'enter'，改为 'immediate' 即输入即搜
      trigger: 'immediate',
    },
  },
  {
    formItem: { name: 'status', label: '状态' },
    component: {
      is: 'ASelect',
      // 下拉框默认是 'immediate'，改为 'enter' 需按回车触发
      trigger: 'enter',
      options: [...],
    },
  },
]
</script>
```

### 注意事项

1. **防抖处理**：`onAutoSearch` 不内置防抖。对于 `trigger: 'immediate'` 的输入类组件，建议在业务层自行实现防抖。
2. **与搜索按钮共存**：启用自动搜索后，搜索按钮仍然会显示（除非设置 `show-search-button="false"`），用户仍可手动点击搜索。
3. **回调时机**：自动搜索触发时，会先执行值更新，再调用 `onAutoSearch` 回调。

---

## 自定义操作按钮

通过 `actions` 插槽自定义操作按钮区域：

```vue
<script setup lang="ts">
const filterRef = ref({})

const handleSearch = () => {
  console.log('搜索:', filterRef.value)
}

const handleExport = () => {
  console.log('导出数据...')
}
</script>

<template>
  <FilterForm
    v-model="filterRef"
    :fields="fields"
    :show-search-button="false"
    :show-reset-button="false"
  >
    <template #actions="{ search, reset }">
      <AButton type="primary" @click="handleSearch">查询</AButton>
      <AButton @click="reset">重置</AButton>
      <AButton @click="handleExport">导出</AButton>
    </template>
  </FilterForm>
</template>
```

插槽参数：

| 参数     | 类型           | 说明           |
| -------- | -------------- | -------------- |
| `search` | `() => void`   | 触发搜索的方法 |
| `reset`  | `() => void`   | 触发重置的方法 |

---

## 与 Crud 集成

FilterForm 作为 Crud 组件的筛选区域，通过 `filter` 配置使用：

```vue
<script setup lang="ts">
import { useCrud } from '@/components/Crud'

const filterFields: FilterField<User>[] = [
  { formItem: { name: 'name', label: '姓名' }, component: { is: 'AInput' } },
  { formItem: { name: 'status', label: '状态' }, component: { is: 'ASelect', options: [...] } },
]

const { CrudComponent } = useCrud({
  api: userApi,
  filter: {
    fields: filterFields,
    collapsed: true,
    collapseCount: 3,
  },
  table: { columns },
})
</script>

<template>
  <CrudComponent />
</template>
```

Crud 筛选配置（`CrudFilterConfig`）：

| 属性           | 类型                          | 默认值 | 说明               |
| -------------- | ----------------------------- | ------ | ------------------ |
| `fields`       | `FilterFieldsConfig<T>`       | -      | 筛选字段配置       |
| `collapsed`    | `boolean`                     | `true` | 是否折叠           |
| `collapseCount`| `number`                      | `3`    | 折叠时显示的字段数 |
| `transform`    | `(params: T) => any`          | -      | 参数转换函数       |

---

## 字段动态显隐

通过 `visible` 属性控制字段的显示与隐藏，支持静态值和函数形式：

### 静态控制

```typescript
const fields: FilterField[] = [
  {
    formItem: { name: 'name', label: '姓名' },
    component: { is: 'AInput' },
    visible: false, // 始终隐藏
  },
]
```

### 动态联动

```vue
<script setup lang="ts">
interface FilterValues {
  type: 'personal' | 'business'
  company: string
}

const filterFields: FilterField<FilterValues>[] = [
  {
    formItem: { name: 'type', label: '类型' },
    component: {
      is: 'ASelect',
      options: [
        { value: 'personal', label: '个人' },
        { value: 'business', label: '企业' },
      ],
    },
  },
  {
    formItem: { name: 'company', label: '公司名称' },
    visible: (formData) => formData.type === 'business', // 选择企业时显示
    component: { is: 'AInput', placeholder: '请输入公司名称' },
  },
]
</script>
```

---

## 完整示例

### 栅格布局 + 展开收起 + 自动搜索

```vue
<script setup lang="ts">
import { FilterForm, type FilterField } from '@/components/FilterForm'

interface FilterValues {
  name: string
  email: string
  phone: string
  department: string
  status: string
  createDate: string
}

const filterFields: FilterField<FilterValues>[] = [
  { formItem: { name: 'name', label: '姓名' }, component: { is: 'AInput' } },
  { formItem: { name: 'email', label: '邮箱' }, component: { is: 'AInput' } },
  { formItem: { name: 'phone', label: '电话' }, component: { is: 'AInput' } },
  {
    formItem: { name: 'department', label: '部门' },
    component: {
      is: 'ASelect',
      options: [
        { value: 'tech', label: '技术部' },
        { value: 'sales', label: '销售部' },
      ],
    },
  },
  {
    formItem: { name: 'status', label: '状态' },
    component: {
      is: 'ASelect',
      options: [
        { value: 'active', label: '在职' },
        { value: 'inactive', label: '离职' },
      ],
    },
  },
  { formItem: { name: 'createDate', label: '入职日期' }, component: { is: 'ADatePicker' } },
]

const handleAutoSearch = (values: FilterValues) => {
  console.log('自动搜索:', values)
}
</script>

<template>
  <FilterForm
    :fields="filterFields"
    layout="grid"
    :columns="4"
    :collapsed="true"
    :default-collapse-count="4"
    :on-auto-search="handleAutoSearch"
  />
</template>
```

---

## 注意事项

1. **组件标识**：`component.is` 支持字符串形式（如 `'AInput'`）和组件引用形式。

2. **类型安全**：建议为表单数据定义明确的 TypeScript 接口，以获得完整的类型提示。

3. **展开收起**：展开收起按钮仅在字段数量超过 `defaultCollapseCount` 时才会显示。

4. **自动搜索防抖**：自动搜索功能不内置防抖，高频输入场景需业务层自行处理。

5. **与 Crud 配合**：在 Crud 组件中使用时，筛选表单的 `search` 事件由 Crud 内部处理，无需手动监听。
