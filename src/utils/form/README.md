# createForm — 命令式表单弹窗

基于 Vue 3 + Ant Design Vue Next 的命令式表单创建工具，通过函数调用即可创建 Modal/Drawer 表单弹窗，无需在模板中预声明。

## 设计理念

### 命令式优于声明式

传统做法需要在模板中声明 `<a-modal>` + `<a-form>` + `<a-form-item>`，并通过 `v-model:open` 控制显隐。`createForm` 采用命令式 API——调用函数即弹出表单，提交/取消后自动销毁：

```ts
const { promise } = createFormModal({ ... });
const result = await promise;   // 提交时 resolve
// 用户取消时 reject Error("用户取消")
```

### 四层配置

渲染结构为 **Container → Form → FormItem → Component**，每层都有独立的配置和插槽支持：

| 层级      | 配置键               | 职责                             |
| --------- | -------------------- | -------------------------------- |
| Modal     | `model`              | 弹窗标题、宽度、遮罩等           |
| Drawer    | `drawer`             | 抽屉标题、方向、尺寸等           |
| Form      | `form`               | 表单布局、标签列宽、栅格行配置等 |
| FormItem  | `fields[].formItem`  | 字段标签、校验提示等             |
| Component | `fields[].component` | 输入组件类型、属性、事件         |

---

## 核心 API

### createFormModal\<T\>(config)

创建 Modal 表单弹窗，返回 `FormDialogReturn<T>`。

### createFormDrawer\<T\>(config)

创建 Drawer 表单弹窗，返回 `FormDialogReturn<T>`。Drawer **自带底部「取消」「确定」按钮**，与 Modal 行为一致。

### FormDialogReturn\<T\>

| 属性        | 类型            | 说明                                                       |
| ----------- | --------------- | ---------------------------------------------------------- |
| `promise`   | `Promise<T>`    | 提交时 resolve 表单数据，取消时 reject `Error("用户取消")` |
| `close`     | `() => void`    | 主动关闭弹窗（走关闭动画）                                 |
| `validate`  | `() => Promise` | 手动触发校验                                               |
| `formState` | `T`             | 响应式表单数据引用                                         |
| `formRef`   | `Ref<any>`      | antdv Form 实例引用                                        |

---

## 配置类型

### CreateFormModalConfig\<T\>

| 属性            | 类型                                                 | 必填   | 说明                                     |
| --------------- | ---------------------------------------------------- | ------ | ---------------------------------------- |
| `model`         | `ModalConfig`                                        | 否     | Modal 弹窗配置                           |
| `form`          | `DynamicConfig<T, FormConfig>`                       | 否     | Form 配置，支持动态函数                  |
| `fields`        | `DynamicConfig<T, FormField<T>[]>`                   | **是** | 表单字段数组，支持动态函数               |
| `rules`         | `DynamicConfig<T, Partial<Record<keyof T, Rule[]>>>` | 否     | 校验规则，支持动态函数                   |
| `initialValues` | `Partial<T>`                                         | 否     | 表单初始值                               |
| `onSubmit`      | `(formData: T) => Promise<void>`                     | 否     | 提交回调，抛异常会显示错误提示并保持弹窗 |

### CreateFormDrawerConfig\<T\>

同上，将 `model` 替换为 `drawer`（DrawerConfig）。

### FormField\<T\>

| 属性        | 类型                                    | 说明                                |
| ----------- | --------------------------------------- | ----------------------------------- |
| `formItem`  | `FormItemConfigExt & { name: keyof T }` | FormItem 配置，必须指定 `name`      |
| `component` | `ComponentConfig<T>`                    | 组件配置                            |
| `visible`   | `boolean \| ((formData: T) => boolean)` | 字段显隐，默认 `true`。隐藏时值保留 |
| `col`       | `ColProps`                              | ACol 栅格配置，配合 `form.row` 使用 |

### ComponentConfig\<T\>

| 属性            | 类型                                       | 说明                                |
| --------------- | ------------------------------------------ | ----------------------------------- |
| `is`            | `ComponentLike`                            | 组件标识：字符串键名或 Vue 组件对象 |
| `modelPropName` | `string`                                   | 双向绑定的 prop 名，默认 `"value"`  |
| `models`        | `{ [prop: string]: keyof T }`              | 多重双向绑定映射                    |
| `slots`         | `Record<string, SlotRender \| VNodeChild>` | 组件级插槽                          |
| `[key: string]` | `any`                                      | 其余属性直接透传给组件              |

### DynamicConfig\<T, R\>

```ts
type DynamicConfig<T, R> = R | ((formData: T) => R)
```

静态值或动态函数二选一。传入函数时，每次渲染以当前表单数据为参数重新调用。

---

## 示例

### 1. 基本 Modal

```ts
const { promise } = createFormModal<LoginForm>({
  model: { title: '登录' },
  fields: [
    { formItem: { name: 'username', label: '用户名' }, component: { is: 'AInput' } },
    { formItem: { name: 'password', label: '密码' }, component: { is: 'AInput' } },
  ],
})
const data = await promise
```

### 2. 基本 Drawer（自带按钮）

Drawer 默认渲染「取消」「确定」底部按钮：

```ts
const { promise } = createFormDrawer<LoginForm>({
  drawer: { title: '登录', placement: 'right', size: 400 },
  fields: [
    { formItem: { name: 'username', label: '用户名' }, component: { is: 'AInput' } },
    { formItem: { name: 'password', label: '密码' }, component: { is: 'AInput' } },
  ],
})
```

### 3. 带校验规则

```ts
const { promise } = createFormModal<UserForm>({
  model: { title: "编辑用户" },
  initialValues: { name: "", email: "", role: "user" },
  rules: {
    name: [{ required: true, message: "请输入姓名" }],
    email: [{ required: true, message: "请输入邮箱" }, { type: "email" }],
  },
  fields: [...],
});
```

### 4. visible 显隐

```ts
{
  formItem: { name: "company", label: "公司名称" },
  visible: (formData) => formData.type === "business",
  component: { is: "AInput" },
}
```

### 5. 动态校验规则

```ts
rules: (formData) => ({
  name: [{ required: true }],
  company: formData.type === "business" ? [{ required: true }] : [],
}),
```

### 6. 事件拦截联动

`onXxx` 事件自动注入 `formState` 作为最后一个参数：

```ts
component: {
  is: "ASelect",
  onChange: (value, option, formData) => {
    formData.memo = `切换为 ${value}`;
  },
},
```

### 7. models 多重绑定

```ts
component: {
  is: FullName,
  models: { firstname: "firstName", lastname: "lastName" },
},
```

### 8. 自定义 modelPropName

```ts
component: { is: "ACheckbox", modelPropName: "checked" },
component: { is: "ASwitch", modelPropName: "checked" },
```

### 9. 栅格排版

```ts
form: { row: { gutter: 16 } },
fields: [
  { formItem: { name: "firstName", label: "名" }, col: { span: 12 }, component: { is: "AInput" } },
  { formItem: { name: "lastName", label: "姓" }, col: { span: 12 }, component: { is: "AInput" } },
],
```

### 10. 容器插槽自定义

Modal / Drawer 插槽自动注入 `SlotScope`（formData / submit / cancel / loading）：

```ts
// Modal footer
model: {
  title: "插槽示例",
  slots: {
    footer: ({ submit, cancel, loading }) =>
      h("div", [h(AButton, { onClick: cancel }, () => "取消"), h(AButton, { onClick: submit, loading }, () => "确认")]),
  },
},

// Drawer footer（覆盖默认按钮）
drawer: {
  title: "自定义 footer",
  slots: {
    footer: ({ submit, cancel, loading }) => h("div", [...]),
  },
},
```

### 11. 主动关闭

```ts
const { promise, close } = createFormModal({ ... });
setTimeout(() => close(), 3000); // 3秒后关闭，走关闭动画

promise.catch(() => console.log("用户取消"));
```

### 12. onSubmit 异步提交

`onSubmit` 抛出异常时会自动显示错误提示并保持弹窗，不抛异常则正常关闭：

```ts
const { promise } = createFormModal<RegisterForm>({
  model: { title: "注册" },
  fields: [...],
  rules: { email: [{ required: true }] },
  onSubmit: async (formData) => {
    await api.register(formData);      // 接口报错会自动抛异常
    // 正常返回 → 弹窗关闭 → promise resolve
  },
});
```

---

## SlotScope

Modal / Drawer 非 default 插槽自动注入的作用域对象：

| 属性       | 类型         | 说明         |
| ---------- | ------------ | ------------ |
| `formData` | `T`          | 当前表单数据 |
| `submit`   | `() => void` | 触发提交     |
| `cancel`   | `() => void` | 关闭弹窗     |
| `loading`  | `boolean`    | 提交中状态   |

---

## 内置组件映射

| 字符串键名    | 对应组件         |
| ------------- | ---------------- |
| `"AInput"`    | `Input`          |
| `"ASelect"`   | `Select`         |
| `"ACheckbox"` | `Checkbox`       |
| `"ASwitch"`   | `Switch`         |
| `"ATextarea"` | `Input.TextArea` |

---

## 生命周期

```
调用 createFormModal / createFormDrawer
  → 创建容器 DOM → 挂载到 body
  → 渲染 Container + RenderForm
  → 用户操作 → 动态配置实时响应
  → 提交：校验 → onSubmit → resolve → 关闭动画 → 销毁 DOM
  → 取消：reject → 关闭动画 → afterClose → 销毁 DOM
  → close()：设置 open=false → 走关闭动画 → reject → 销毁 DOM
```
