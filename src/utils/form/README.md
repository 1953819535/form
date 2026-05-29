# createForm — 命令式表单弹窗工具

基于 Vue 3 + Ant Design Vue 的命令式表单创建工具，通过函数调用即可动态创建包含表单的 Modal 弹窗，无需在模板中预声明。

## 设计理念

### 1. 命令式优于声明式

传统做法需要在模板中声明 `<a-modal>` + `<a-form>` + `<a-form-item>`，并通过 `v-model:open` 控制显隐。当页面有多个表单弹窗时，模板会迅速膨胀。

`createForm` 采用命令式 API——调用函数即弹出表单，提交/取消后自动销毁，调用方通过 `Promise` 获取结果：

```ts
const { promise } = createForm({ ... });
const result = await promise;  // 提交时 resolve
// 用户取消时 reject，可用 catch 捕获
```

### 2. 四层嵌套，逐层配置

渲染结构为 **Modal → Form → FormItem → Component**，每层都有独立的配置和插槽支持：

| 层级 | 配置键 | 职责 |
|------|--------|------|
| Modal | `model` | 弹窗标题、宽度、遮罩等 |
| Form | `form` | 表单布局、标签列宽、栅格行配置等 |
| FormItem | `fields[].formItem` | 字段标签、校验提示、栅格列配置等 |
| Component | `fields[].component` | 输入组件类型、属性、事件 |

### 3. 动态配置为核心能力

`fields`、`form`、`rules` 均支持传入函数，函数接收当前表单数据作为参数，每次渲染重新计算。这让字段联动、条件显示、动态校验等场景无需额外状态管理：

```ts
fields: (formData) => {
  const fields = [baseField];
  if (formData.type === 'advanced') {
    fields.push(advancedField);
  }
  return fields;
}
```

### 4. 字段级显隐控制

`visible` 属性支持布尔值或函数，函数接收当前表单数据。相比动态 `fields` 的 push 写法，`visible` 语义更清晰，且不会丢失已填数据（隐藏字段值保留，只是不渲染）：

```ts
{
  formItem: { name: "company", label: "公司名称" },
  visible: (formData) => formData.type === "business",
  component: { is: "AInput" },
}
```

### 5. 栅格排版

通过 `form.row` 和 `fields[].col` 配置 ARow / ACol 属性，实现多列表单布局，无需手写 CSS：

```ts
form: { row: { gutter: 16 } },
fields: [
  { formItem: { name: "firstName" }, col: { span: 12 }, component: { is: "AInput" } },
  { formItem: { name: "lastName" },  col: { span: 12 }, component: { is: "AInput" } },
]
```

### 6. 自动双向绑定

根据 `modelPropName` 和 `models` 自动生成 `v-model` 绑定逻辑，无需手动处理 `value` / `onUpdate:value`。支持单值绑定和多值绑定（如日期范围选择器）。

### 7. 事件拦截注入

组件的 `onXxx` 事件回调会自动注入 `formState` 作为最后一个参数，方便在事件处理中访问和修改完整的表单状态，实现联动效果。

### 8. 上下文注入

通过 `appContext` 注入 Vue 应用上下文，使弹窗内的组件可以访问 Pinia、Router、ConfigProvider 等全局依赖。

### 9. 表单实例暴露

`createForm` 返回 `CreateFormReturn` 对象，包含 `promise`、`close`、`validate`、`formState`、`formRef`，调用方可从外部控制表单生命周期。

---

## API 参考

### createForm\<T\>(config): CreateFormReturn\<T\>

创建一个包含表单的 Modal 弹窗。`T` 为表单数据类型。

### CreateFormReturn\<T\>

| 属性 | 类型 | 说明 |
|------|------|------|
| `promise` | `Promise<T>` | 提交时 resolve 表单数据，取消时 reject `Error("用户取消")` |
| `close` | `() => void` | 手动关闭弹窗 |
| `validate` | `() => Promise<T>` | 手动触发校验，返回表单数据 |
| `formState` | `T` | 响应式表单数据引用 |
| `formRef` | `Ref<FormInstance \| undefined>` | antdv Form 实例引用 |

### CreateFormConfig\<T\>

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | `ModalConfig` | 否 | Modal 弹窗配置 |
| `form` | `DynamicConfig<T, FormConfig>` | 否 | Form 表单配置，支持动态函数 |
| `fields` | `DynamicConfig<T, FormField<T>[]>` | **是** | 表单字段数组，支持动态函数 |
| `rules` | `DynamicConfig<T, Partial<Record<keyof T, Rule[]>>>` | 否 | 校验规则，支持动态函数 |
| `initialValues` | `Partial<T>` | 否 | 表单初始值 |
| `appContext` | `AppContext` | 否 | Vue 应用上下文，用于注入全局依赖 |
| `onSubmit` | `(formData: T) => Promise<void>` | 否 | 提交回调，抛异常会显示错误提示并保持弹窗 |

### FormField\<T\>

| 属性 | 类型 | 说明 |
|------|------|------|
| `formItem` | `FormItemConfigExt & { name: keyof T }` | FormItem 配置，必须指定 `name` |
| `component` | `ComponentConfig<T>` | 组件配置 |
| `visible` | `boolean \| ((formData: T) => boolean)` | 字段显隐控制，默认 `true`。隐藏时值保留 |
| `col` | `ColProps` | ACol 栅格配置，配合 `form.row` 使用 |

### FormConfig

| 属性 | 类型 | 说明 |
|------|------|------|
| `layout` | `"horizontal" \| "vertical" \| "inline"` | 表单布局 |
| `labelCol` | `ColProps` | 标签栅格 |
| `wrapperCol` | `ColProps` | 输入控件栅格 |
| `row` | `RowProps` | ARow 栅格行配置，启用后字段自动包裹 ACol |
| `slots` | `Record<string, SlotRender \| VNodeChild>` | Form 级插槽（prefix / suffix） |

### ComponentConfig\<T\>

| 属性 | 类型 | 说明 |
|------|------|------|
| `is` | `ComponentLike` | 组件标识：字符串键名或 Vue 组件对象 |
| `modelPropName` | `string` | 双向绑定的 prop 名，默认 `"value"` |
| `models` | `{ [prop: string]: keyof T }` | 多重双向绑定映射 |
| `slots` | `Record<string, SlotRender \| VNodeChild>` | 组件级插槽 |
| `[key: string]` | `any` | 其余属性直接透传给组件，含事件监听器 |

### DynamicConfig\<T, R\>

```ts
type DynamicConfig<T, R> = R | ((formData: T) => R);
```

静态值或动态函数二选一。传入函数时，每次渲染都会以当前表单数据为参数重新调用。

### useCreateForm\<T\>()

Composition API 辅助钩子，自动注入当前组件的 `appContext`：

```ts
const { createForm } = useCreateForm<T>();
const { promise } = createForm({ ... });
```

### Modal 插槽作用域

Modal 非 default 插槽（如 footer）的渲染函数会自动注入作用域对象：

```ts
slots: {
  footer: ({ formData, submit, cancel, loading }) => {
    // formData  — 当前表单数据
    // submit    — 触发提交
    // cancel    — 触发取消
    // loading   — 提交中状态
  }
}
```

### 内置组件映射

| 字符串键名 | 对应组件 |
|------------|----------|
| `"AInput"` | `Input` |
| `"ASelect"` | `Select` |
| `"ACheckbox"` | `Checkbox` |
| `"ASwitch"` | `Switch` |
| `"ATextarea"` | `Input.TextArea` |

---

## 示例

### 1. 基础用法

最简单的表单弹窗，静态字段配置：

```ts
interface LoginForm {
  username: string;
  password: string;
}

const { promise } = createForm<LoginForm>({
  model: { title: "登录" },
  fields: [
    {
      formItem: { name: "username", label: "用户名" },
      component: { is: "AInput", placeholder: "请输入用户名" },
    },
    {
      formItem: { name: "password", label: "密码" },
      component: { is: "AInput", placeholder: "请输入密码" },
    },
  ],
});

const result = await promise;
console.log(result.username, result.password);
```

### 2. 带初始值和校验规则

```ts
interface UserForm {
  name: string;
  email: string;
  role: "admin" | "user";
}

const { promise } = createForm<UserForm>({
  model: { title: "编辑用户" },
  initialValues: { name: "", email: "", role: "user" },
  rules: {
    name: [{ required: true, message: "请输入姓名" }],
    email: [
      { required: true, message: "请输入邮箱" },
      { type: "email", message: "邮箱格式不正确" },
    ],
  },
  fields: [
    {
      formItem: { name: "name", label: "姓名" },
      component: { is: "AInput", placeholder: "请输入姓名" },
    },
    {
      formItem: { name: "email", label: "邮箱" },
      component: { is: "AInput", placeholder: "请输入邮箱" },
    },
    {
      formItem: { name: "role", label: "角色" },
      component: {
        is: "ASelect",
        options: [
          { value: "user", label: "普通用户" },
          { value: "admin", label: "管理员" },
        ],
      },
    },
  ],
});
```

### 3. 动态字段 — 条件显示

根据表单数据动态决定显示哪些字段。当 `type` 为 `"business"` 时，额外显示公司名称字段：

```ts
interface ContactForm {
  type: "personal" | "business";
  name: string;
  company: string;
}

const { promise } = createForm<ContactForm>({
  model: { title: "添加联系人" },
  initialValues: { type: "personal", name: "", company: "" },
  fields: (formData) => {
    const fields: FormField<ContactForm>[] = [
      {
        formItem: { name: "type", label: "类型" },
        component: {
          is: "ASelect",
          options: [
            { value: "personal", label: "个人" },
            { value: "business", label: "企业" },
          ],
        },
      },
      {
        formItem: { name: "name", label: "姓名" },
        component: { is: "AInput", placeholder: "请输入姓名" },
      },
    ];

    if (formData.type === "business") {
      fields.push({
        formItem: { name: "company", label: "公司名称" },
        component: { is: "AInput", placeholder: "请输入公司名称" },
      });
    }

    return fields;
  },
});
```

### 4. 字段级 visible 显隐控制

相比动态 fields push 的写法，`visible` 语义更清晰，且隐藏字段值不会丢失：

```ts
interface ContactForm {
  type: "personal" | "business";
  name: string;
  company: string;
}

const { promise } = createForm<ContactForm>({
  model: { title: "添加联系人" },
  initialValues: { type: "personal", name: "", company: "" },
  fields: [
    {
      formItem: { name: "type", label: "类型" },
      component: {
        is: "ASelect",
        options: [
          { value: "personal", label: "个人" },
          { value: "business", label: "企业" },
        ],
      },
    },
    {
      formItem: { name: "name", label: "姓名" },
      component: { is: "AInput", placeholder: "请输入姓名" },
    },
    {
      formItem: { name: "company", label: "公司名称" },
      visible: (formData) => formData.type === "business",
      component: { is: "AInput", placeholder: "请输入公司名称" },
    },
  ],
});
```

### 5. 动态校验规则

根据表单数据动态生成校验规则。企业类型时公司名称必填：

```ts
const { promise } = createForm<ContactForm>({
  model: { title: "添加联系人（动态校验）" },
  initialValues: { type: "personal", name: "", company: "" },
  fields: [/* ... */],
  rules: (formData) => ({
    name: [{ required: true, message: "请输入姓名" }],
    company:
      formData.type === "business"
        ? [{ required: true, message: "请输入公司名称" }]
        : [],
  }),
});
```

### 6. 事件拦截 — 表单联动

组件的 `onXxx` 事件回调会自动注入 `formState` 作为最后一个参数，可直接修改表单状态实现联动：

```ts
interface LinkageForm {
  role: "admin" | "user";
  nickname: string;
  memo: string;
}

const { promise } = createForm<LinkageForm>({
  model: { title: "事件监听与表单联动修改" },
  initialValues: { role: "user", nickname: "", memo: "" },
  fields: [
    {
      formItem: { name: "role", label: "角色选择" },
      component: {
        is: "ASelect",
        options: [
          { value: "user", label: "普通用户" },
          { value: "admin", label: "管理员" },
        ],
        // onChange 原生参数为 (value, option)，createForm 自动追加 formData
        onChange: (value: string, option: any, formData: LinkageForm) => {
          formData.nickname = "";
          formData.memo = `已将角色切换为：${value === "admin" ? "管理员" : "普通用户"}`;
        },
      },
    },
    {
      formItem: { name: "nickname", label: "昵称" },
      component: {
        is: "AInput",
        placeholder: "请输入昵称",
        // onBlur 原生参数为 (event)，createForm 自动追加 formData
        onBlur: (event: FocusEvent, formData: LinkageForm) => {
          if (formData.nickname) {
            formData.nickname = formData.nickname.toUpperCase();
          }
        },
      },
    },
    {
      formItem: { name: "memo", label: "备注信息" },
      component: { is: "AInput", disabled: true },
    },
  ],
});
```

### 7. 多重双向绑定 — models

当一个组件需要同时绑定多个表单字段时，使用 `models` 配置：

```ts
// FullName.vue 组件内部使用 defineModel 多实例
// const firstname = defineModel("firstname", { type: String });
// const lastname = defineModel("lastname", { type: String });

import FullName from "@/components/FullName.vue";

interface NameForm {
  firstName: string;
  lastName: string;
}

const { promise } = createForm<NameForm>({
  model: { title: "编辑姓名" },
  initialValues: { firstName: "", lastName: "" },
  fields: [
    {
      formItem: { name: "firstName", label: "姓名" },
      component: {
        is: FullName,
        // models 映射：组件 prop → 表单字段
        models: {
          firstname: "firstName",
          lastname: "lastName",
        },
      },
    },
  ],
});
```

### 8. 自定义 modelPropName

`ACheckbox` 和 `ASwitch` 使用 `checked` 而非 `value` 作为绑定 prop，通过 `modelPropName` 指定：

```ts
interface SettingsForm {
  enabled: boolean;
  notify: boolean;
}

const { promise } = createForm<SettingsForm>({
  model: { title: "设置" },
  initialValues: { enabled: false, notify: true },
  fields: [
    {
      formItem: { name: "enabled", label: "启用" },
      component: { is: "ACheckbox", modelPropName: "checked" },
    },
    {
      formItem: { name: "notify", label: "通知" },
      component: { is: "ASwitch", modelPropName: "checked" },
    },
  ],
});
```

### 9. 栅格排版

通过 `form.row` 和 `fields[].col` 实现多列表单布局：

```ts
interface NameForm {
  firstName: string;
  lastName: string;
  email: string;
}

const { promise } = createForm<NameForm>({
  model: { title: "栅格排版" },
  form: {
    row: { gutter: 16 },
  },
  fields: [
    {
      formItem: { name: "firstName", label: "名" },
      col: { span: 12 },
      component: { is: "AInput", placeholder: "First Name" },
    },
    {
      formItem: { name: "lastName", label: "姓" },
      col: { span: 12 },
      component: { is: "AInput", placeholder: "Last Name" },
    },
    {
      formItem: { name: "email", label: "邮箱" },
      col: { span: 24 },
      component: { is: "AInput", placeholder: "请输入邮箱" },
    },
  ],
});
```

### 10. 插槽自定义

每一层都支持插槽配置。Modal 非 default 插槽的渲染函数会自动注入 `slotScope`（含 formData / submit / cancel / loading）：

```ts
const { promise } = createForm({
  model: {
    title: "插槽示例",
    // Modal 级插槽 — footer 自动注入 { formData, submit, cancel, loading }
    slots: {
      footer: ({ formData, submit, cancel, loading }) =>
        h("div", { style: "display: flex; justify-content: flex-end; gap: 8px" }, [
          h(AButton, { onClick: cancel }, "取消"),
          h(AButton, { type: "primary", onClick: submit, loading }, "确认"),
        ]),
    },
  },
  form: {
    layout: "vertical",
    // Form 级插槽：prefix / suffix 在字段前后插入内容
    slots: {
      prefix: () => h("p", { style: "color: #999" }, "请填写以下信息"),
      suffix: () => h("p", { style: "color: #999" }, "带 * 为必填项"),
    },
  },
  fields: [
    {
      formItem: {
        name: "username",
        label: "用户名",
        // FormItem 级插槽
        slots: {
          extra: () => h("span", { style: "color: #999" }, "4-20位字母数字"),
        },
      },
      component: {
        is: "AInput",
        placeholder: "请输入用户名",
        // Component 级插槽
        slots: {
          suffix: () => h("span", "\u{1F464}"),
        },
      },
    },
  ],
});
```

### 11. CreateFormReturn — 外部控制表单

`createForm` 返回对象包含 `promise`、`close`、`validate`、`formState`、`formRef`，可从外部控制表单：

```ts
interface MyForm {
  username: string;
  email: string;
}

const { promise, close, validate, formState, formRef } = createForm<MyForm>({
  model: { title: "外部控制" },
  fields: [
    {
      formItem: { name: "username", label: "用户名" },
      component: { is: "AInput" },
    },
    {
      formItem: { name: "email", label: "邮箱" },
      component: { is: "AInput" },
    },
  ],
});

// 手动校验
const validData = await validate();

// 访问响应式表单数据
console.log(formState.username);

// 手动关闭弹窗
close();

// 等待用户提交
const result = await promise;
```

### 12. useCreateForm — Composition API

在 `setup` 中使用 `useCreateForm` 自动注入当前组件的 `appContext`，弹窗内组件可访问 Pinia / Router 等全局依赖：

```ts
import { useCreateForm } from "@/utils/form";

const { createForm } = useCreateForm<MyForm>();

const { promise } = createForm({
  model: { title: "Composition API" },
  fields: [/* ... */],
});

const result = await promise;
```

### 13. onSubmit 与错误处理

`onSubmit` 在校验通过后调用。如果回调抛出异常，会自动显示错误提示并保持弹窗打开：

```ts
interface RegisterForm {
  email: string;
  code: string;
}

const { promise } = createForm<RegisterForm>({
  model: { title: "注册" },
  initialValues: { email: "", code: "" },
  fields: [
    {
      formItem: { name: "email", label: "邮箱" },
      component: { is: "AInput", placeholder: "请输入邮箱" },
    },
    {
      formItem: { name: "code", label: "验证码" },
      component: { is: "AInput", placeholder: "请输入验证码" },
    },
  ],
  rules: {
    email: [{ required: true, message: "请输入邮箱" }],
    code: [{ required: true, message: "请输入验证码" }],
  },
  onSubmit: async (formData) => {
    const res = await api.register(formData);
    if (!res.success) {
      throw new Error(res.message); // 自动显示错误提示，弹窗保持打开
    }
  },
});
```

### 14. 处理用户取消

用户点击取消或关闭弹窗时，Promise 会 reject：

```ts
const { promise } = createForm<LoginForm>({ /* ... */ });

try {
  const result = await promise;
  console.log("提交成功", result);
} catch {
  console.log("用户取消");
}
```

---

## 生命周期

```
创建容器 DOM → 挂载到 body
  ↓
渲染 FormWrapper 组件（Modal + Form + FormItems）
  ↓
用户操作 → 动态配置实时响应
  ↓
提交：校验 → onSubmit → resolve → 关闭弹窗 → 销毁 DOM
取消：reject → 关闭弹窗 → afterClose → 销毁 DOM
```

## 扩展组件映射

在 `src/utils/form/index.ts` 中的 `componentMap` 对象添加新组件即可：

```ts
const componentMap = {
  AInput,
  ASelect,
  ACheckbox,
  ASwitch,
  ATextarea: AInput.TextArea,
  // 新增组件
  AInputNumber: InputNumber,
  ADatePicker: DatePicker,
};
```

添加后即可在 `component.is` 中使用字符串键名引用。
