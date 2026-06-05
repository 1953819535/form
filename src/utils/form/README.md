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

## 完整示例

以下示例按功能分类，涵盖所有特性：

### 一、基础用法

#### 1. 基本 Modal

```ts
const { promise } = createFormModal<LoginForm>({
  model: { title: "登录", width: 520 },
  fields: [
    { formItem: { name: "username", label: "用户名" }, component: { is: "AInput", placeholder: "请输入用户名" } },
    { formItem: { name: "password", label: "密码" }, component: { is: "AInput", placeholder: "请输入密码" } },
  ],
});
promise.then((data) => AMessage.success(`登录成功：${data.username}`));
```

#### 2. 基本 Drawer（自带按钮）

Drawer 默认渲染「取消」「确定」底部按钮：

```ts
const { promise } = createFormDrawer<LoginForm>({
  drawer: { title: "登录", placement: "right", size: 400 },
  fields: [
    { formItem: { name: "username", label: "用户名" }, component: { is: "AInput" } },
    { formItem: { name: "password", label: "密码" }, component: { is: "AInput" } },
  ],
});
```

#### 3. 带初始值和校验规则

```ts
const { promise } = createFormModal<UserForm>({
  model: { title: "编辑用户" },
  initialValues: { name: "张三", email: "zhangsan@example.com", role: "user" },
  rules: {
    name: [{ required: true, message: "请输入姓名" }],
    email: [{ required: true, message: "请输入邮箱" }, { type: "email", message: "邮箱格式不正确" }],
  },
  fields: [
    { formItem: { name: "name", label: "姓名" }, component: { is: "AInput" } },
    { formItem: { name: "email", label: "邮箱" }, component: { is: "AInput" } },
    { formItem: { name: "role", label: "角色" }, component: { is: "ASelect", options: [...] } },
  ],
});
```

---

### 二、动态配置

#### 4. visible 显隐控制

```ts
{
  formItem: { name: "company", label: "公司名称" },
  visible: (formData) => formData.type === "business",
  component: { is: "AInput", placeholder: "请输入公司名称" },
}
```

#### 5. 动态校验规则

```ts
rules: (formData) => ({
  name: [{ required: true, message: "请输入姓名" }],
  company: formData.type === "business" ? [{ required: true, message: "请输入公司名称" }] : [],
}),
```

#### 6. 动态 fields（条件显示）

```ts
fields: (formData) => {
  const fields: FormField<ContactForm>[] = [
    { formItem: { name: "type", label: "类型" }, component: { is: "ASelect", options: [...] } },
    { formItem: { name: "name", label: "姓名" }, component: { is: "AInput" } },
  ];
  if (formData.type === "business") {
    fields.push({ formItem: { name: "company", label: "公司名称" }, component: { is: "AInput" } });
  }
  return fields;
},
```

---

### 三、事件与联动

#### 7. 事件拦截联动

`onXxx` 事件自动注入 `formState` 作为最后一个参数：

```ts
component: {
  is: "ASelect",
  options: [...],
  onChange: (value: string, _option: any, formData: LinkageForm) => {
    formData.nickname = "";
    formData.memo = `已将角色切换为：${value === "admin" ? "管理员" : "普通用户"}`;
  },
},
```

#### 8. onBlur 等其他事件

```ts
component: {
  is: "AInput",
  placeholder: "请输入昵称",
  onBlur: (_event: FocusEvent, formData: LinkageForm) => {
    if (formData.nickname) {
      formData.nickname = formData.nickname.toUpperCase();
    }
  },
},
```

---

### 四、特殊绑定

#### 9. models 多重绑定

当一个组件需要同时绑定多个表单字段时：

```ts
// FullName.vue 内部使用 defineModel 多实例
const firstname = defineModel("firstname", { type: String });
const lastname = defineModel("lastname", { type: String });

// 使用
component: {
  is: FullName,
  models: { firstname: "firstName", lastname: "lastName" },
},
```

#### 10. 自定义 modelPropName（Checkbox / Switch）

```ts
component: { is: "ACheckbox", modelPropName: "checked" },
component: { is: "ASwitch", modelPropName: "checked" },
```

---

### 五、布局与排版

#### 11. 栅格排版

```ts
form: { row: { gutter: 16 } },
fields: [
  { formItem: { name: "firstName", label: "名" }, col: { span: 12 }, component: { is: "AInput" } },
  { formItem: { name: "lastName", label: "姓" }, col: { span: 12 }, component: { is: "AInput" } },
  { formItem: { name: "email", label: "邮箱" }, col: { span: 24 }, component: { is: "AInput" } },
],
```

---

### 六、插槽自定义

#### 12. 容器插槽（Modal / Drawer footer）

Modal / Drawer 插槽自动注入 `SlotScope`：

```ts
model: {
  title: "自定义 footer",
  slots: {
    footer: ({ submit, cancel, loading }) =>
      h("div", { style: "display: flex; justify-content: space-between" }, [
        h(AButton, { danger: true, onClick: cancel }, () => "危险取消"),
        h(AButton, { type: "primary", onClick: submit, loading }, () => "确认提交"),
      ]),
  },
},

// Drawer 同理
drawer: {
  title: "自定义 footer",
  placement: "left",
  slots: {
    footer: ({ submit, cancel, loading }) => h("div", [...]),
  },
},
```

#### 13. Form 级插槽（prefix / suffix）

```ts
form: {
  layout: "vertical",
  slots: {
    prefix: () => h("p", { style: "color: #999; margin-bottom: 16px" }, "请填写以下信息"),
    suffix: () => h("p", { style: "color: #999; margin-top: 8px" }, "带 * 为必填项"),
  },
},
```

#### 14. FormItem 级插槽（extra）

```ts
formItem: {
  name: "username",
  label: "用户名",
  slots: {
    extra: () => h("span", { style: "color: #999" }, "4-20位字母数字"),
  },
},
```

#### 15. Component 级插槽（suffix）

```ts
component: {
  is: "AInput",
  placeholder: "请输入用户名",
  slots: {
    suffix: () => h("span", "👤"),
  },
},
```

---

### 七、异步与控制

#### 16. onSubmit 异步提交

`onSubmit` 抛出异常时会自动显示错误提示并保持弹窗：

```ts
onSubmit: async (formData) => {
  await new Promise((r) => setTimeout(r, 1000));
  if (formData.code !== "1234") {
    throw new Error("验证码错误，请重新输入");
  }
},
```

#### 17. 主动关闭 + formState

```ts
const { promise, close, validate, formState } = createFormModal<LoginForm>({
  model: { title: "外部控制" },
  fields: [...],
});

// 3秒后自动关闭
setTimeout(() => close(), 3000);

// 访问响应式表单数据
console.log("formState:", formState);

promise
  .then((data) => AMessage.success(`提交成功：${data.username}`))
  .catch(() => AMessage.info("弹窗已关闭"));
```

#### 18. 处理用户取消

```ts
const { promise } = createFormModal<LoginForm>({ ... });
promise
  .then((data) => AMessage.success(`提交成功：${data.username}`))
  .catch(() => AMessage.info("用户取消了操作"));
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

## 全局配置共享

弹窗组件通过 `AConfigProvider` 包裹，与主应用共享配置：

```ts
// src/config/antdConfig.ts
export const antdConfig = {
  locale: zhCN,  // 中文
  // direction: 'rtl',
  // theme: { ... },
};

// 主应用 App.vue
<a-config-provider v-bind="antdConfig">

// 弹窗内部自动包裹 AConfigProvider，继承相同配置
```

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

---

## 文件结构

```
src/utils/form/
├── index.ts              # 统一导出
├── types.ts              # 类型定义
├── createFormModal.ts    # Modal 入口
├── createFormDrawer.ts   # Drawer 入口
├── mountHelper.ts        # 挂载逻辑
├── modalContainer.ts     # Modal 容器组件
├── drawerContainer.ts    # Drawer 容器组件
├── renderForm.ts         # 表单渲染组件
└── renderHelper.ts       # 渲染辅助函数

src/config/
└── antdConfig.ts         # 全局配置共享
```