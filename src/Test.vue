<script setup lang="ts">
import { ref } from "vue";
import { h } from "vue";
import { Button as AButton, message as AMessage } from "antdv-next";
import {
  createFormModal,
  createFormDrawer,
  type FormField,
} from "@/utils/form";
import FullName from "@/components/FullName.vue";
import { FilterForm, type FilterField } from "@/components/FilterForm";

// ──────────────────────────────────────────────────────────────
// 基础类型定义
// ──────────────────────────────────────────────────────────────
interface LoginForm {
  username: string;
  password: string;
}

interface UserForm {
  name: string;
  email: string;
  role: "admin" | "user";
}

interface ContactForm {
  type: "personal" | "business";
  name: string;
  company: string;
}

interface SettingsForm {
  enabled: boolean;
  notify: boolean;
}

interface NameForm {
  firstName: string;
  lastName: string;
}

interface GridForm {
  firstName: string;
  lastName: string;
  email: string;
}

interface LinkageForm {
  role: "admin" | "user";
  nickname: string;
  memo: string;
}

interface RegisterForm {
  email: string;
  code: string;
}

// ──────────────────────────────────────────────────────────────
// FilterForm 筛选组件测试
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
// FilterForm 测试 2: 栅格布局 + 展开收起
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
// FilterForm 测试 3: 动态字段（函数形式）
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
// FilterForm 测试 4: 受控模式
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
// FilterForm 测试 5: 自定义操作按钮
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

// ──────────────────────────────────────────────────────────────
// 1. 基本 Modal
// ──────────────────────────────────────────────────────────────
const handleModal1 = () => {
  const { promise } = createFormModal<LoginForm>({
    model: { title: "登录", width: 520 },
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
  promise.then((data) => AMessage.success(`登录成功：${data.username}`));
};

// ──────────────────────────────────────────────────────────────
// 2. 基本 Drawer（自带底部按钮）
// ──────────────────────────────────────────────────────────────
const handleDrawer1 = () => {
  const { promise } = createFormDrawer<LoginForm>({
    drawer: { title: "登录（Drawer）", placement: "right", size: 400 },
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
  promise.then((data) => AMessage.success(`登录成功：${data.username}`));
};

// ──────────────────────────────────────────────────────────────
// 3. 带初始值和校验规则
// ──────────────────────────────────────────────────────────────
const handleModal2 = () => {
  const { promise } = createFormModal<UserForm>({
    model: { title: "编辑用户" },
    initialValues: {
      name: "张三",
      email: "zhangsan@example.com",
      role: "user",
    },
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
  promise.then((data) => AMessage.success(`用户 ${data.name} 保存成功`));
};

// ──────────────────────────────────────────────────────────────
// 4. visible 显隐控制 + 动态校验
// ──────────────────────────────────────────────────────────────
const handleDrawer2 = () => {
  const { promise } = createFormDrawer<ContactForm>({
    drawer: { title: "添加联系人", placement: "right", size: 450 },
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
    rules: (formData) => ({
      name: [{ required: true, message: "请输入姓名" }],
      company:
        formData.type === "business"
          ? [{ required: true, message: "请输入公司名称" }]
          : [],
    }),
  });
  promise.then((data) => AMessage.success(`联系人 ${data.name} 添加成功`));
};

// ──────────────────────────────────────────────────────────────
// 5. 事件拦截联动
// ──────────────────────────────────────────────────────────────
const handleModal3 = () => {
  const { promise } = createFormModal<LinkageForm>({
    model: { title: "事件监听与联动" },
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
          onChange: (value: string, _option: any, formData: LinkageForm) => {
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
          onBlur: (_event: FocusEvent, formData: LinkageForm) => {
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
  promise.then((data) => AMessage.success(`保存成功：${data.nickname}`));
};

// ──────────────────────────────────────────────────────────────
// 6. models 多重绑定
// ──────────────────────────────────────────────────────────────
const handleModal4 = () => {
  const { promise } = createFormModal<NameForm>({
    model: { title: "编辑姓名（models 多重绑定）" },
    initialValues: { firstName: "", lastName: "" },
    fields: [
      {
        formItem: { name: "firstName", label: "姓名" },
        component: {
          is: FullName,
          models: {
            firstname: "firstName",
            lastname: "lastName",
          },
        },
      },
    ],
  });
  promise.then((data) =>
    AMessage.success(`${data.firstName} ${data.lastName}`),
  );
};

// ──────────────────────────────────────────────────────────────
// 7. 自定义 modelPropName（Checkbox / Switch）
// ──────────────────────────────────────────────────────────────
const handleDrawer3 = () => {
  const { promise } = createFormDrawer<SettingsForm>({
    drawer: { title: "系统设置", placement: "right", size: 400 },
    initialValues: { enabled: false, notify: true },
    fields: [
      {
        formItem: { name: "enabled", label: "启用功能" },
        component: { is: "ACheckbox", modelPropName: "checked" },
      },
      {
        formItem: { name: "notify", label: "消息通知" },
        component: { is: "ASwitch", modelPropName: "checked" },
      },
    ],
  });
  promise.then((data) =>
    AMessage.success(`启用：${data.enabled}，通知：${data.notify}`),
  );
};

// ──────────────────────────────────────────────────────────────
// 8. 栅格排版
// ──────────────────────────────────────────────────────────────
const handleModal5 = () => {
  const { promise } = createFormModal<GridForm>({
    model: { title: "栅格排版" },
    form: {
      row: { gutter: 16 },
    },
    initialValues: { firstName: "", lastName: "", email: "" },
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
  promise.then((data) =>
    AMessage.success(`${data.firstName} ${data.lastName} / ${data.email}`),
  );
};

// ──────────────────────────────────────────────────────────────
// 9. 动态 fields（条件显示）
// ──────────────────────────────────────────────────────────────
const handleModal6 = () => {
  const { promise } = createFormModal<ContactForm>({
    model: { title: "动态字段（条件显示）" },
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
  promise.then((data) => AMessage.success(`联系人 ${data.name} 添加成功`));
};

// ──────────────────────────────────────────────────────────────
// 10. 自定义 Modal footer
// ──────────────────────────────────────────────────────────────
const handleModal7 = () => {
  const { promise } = createFormModal<LoginForm>({
    model: {
      title: "自定义 footer",
      slots: {
        footer: ({ submit, cancel, loading }) =>
          h("div", { style: "display: flex; justify-content: space-between" }, [
            h(AButton, { danger: true, onClick: cancel }, () => "危险取消"),
            h(
              AButton,
              { type: "primary", onClick: submit, loading },
              () => "确认提交",
            ),
          ]),
      },
    },
    fields: [
      {
        formItem: { name: "username", label: "用户名" },
        component: { is: "AInput", placeholder: "请输入用户名" },
      },
    ],
  });
  promise.then((data) => AMessage.success(`提交成功：${data.username}`));
};

// ──────────────────────────────────────────────────────────────
// 11. 自定义 Drawer footer
// ──────────────────────────────────────────────────────────────
const handleDrawer4 = () => {
  const { promise } = createFormDrawer<LoginForm>({
    drawer: {
      title: "自定义 footer",
      placement: "left",
      size: 400,
      slots: {
        footer: ({ submit, cancel, loading }) =>
          h(
            "div",
            { style: "display: flex; justify-content: flex-end; gap: 8px" },
            [
              h(AButton, { onClick: cancel }, () => "取消"),
              h(
                AButton,
                { type: "primary", onClick: submit, loading },
                () => "确认",
              ),
            ],
          ),
      },
    },
    fields: [
      {
        formItem: { name: "username", label: "用户名" },
        component: { is: "AInput", placeholder: "请输入用户名" },
      },
    ],
  });
  promise.then((data) => AMessage.success(`提交成功：${data.username}`));
};

// ──────────────────────────────────────────────────────────────
// 12. onSubmit 异步提交（验证码：1234）
// ──────────────────────────────────────────────────────────────
const handleModal8 = () => {
  const { promise } = createFormModal<RegisterForm>({
    model: { title: "注册（验证码：1234）" },
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
      await new Promise((r) => setTimeout(r, 1000));
      if (formData.code !== "1234") {
        throw new Error("验证码错误，请重新输入");
      }
    },
  });
  promise.then((data) => AMessage.success(`注册成功：${data.email}`));
};

// ──────────────────────────────────────────────────────────────
// 13. 主动关闭 + validate 手动校验
// ──────────────────────────────────────────────────────────────
const handleModal9 = () => {
  const { promise, close, validate, formState } = createFormModal<LoginForm>({
    model: { title: "外部控制（3秒自动关闭）" },
    fields: [
      {
        formItem: { name: "username", label: "用户名" },
        component: { is: "AInput", placeholder: "请输入用户名" },
      },
    ],
  });

  // 3秒后自动关闭
  setTimeout(() => close(), 3000);

  // 手动校验示例
  console.log("formState:", formState);

  promise
    .then((data) => AMessage.success(`提交成功：${data.username}`))
    .catch(() => AMessage.info("弹窗已关闭"));
};

// ──────────────────────────────────────────────────────────────
// 14. 处理用户取消
// ──────────────────────────────────────────────────────────────
const handleModal10 = () => {
  const { promise } = createFormModal<LoginForm>({
    model: { title: "取消示例" },
    fields: [
      {
        formItem: { name: "username", label: "用户名" },
        component: { is: "AInput", placeholder: "请输入用户名" },
      },
    ],
  });
  promise
    .then((data) => AMessage.success(`提交成功：${data.username}`))
    .catch(() => AMessage.info("用户取消了操作"));
};

// ──────────────────────────────────────────────────────────────
// 15. Textarea 组件
// ──────────────────────────────────────────────────────────────
interface RemarkForm {
  title: string;
  content: string;
}

const handleDrawer5 = () => {
  const { promise } = createFormDrawer<RemarkForm>({
    drawer: { title: "备注信息", placement: "right", size: 500 },
    initialValues: { title: "", content: "" },
    fields: [
      {
        formItem: { name: "title", label: "标题" },
        component: { is: "AInput", placeholder: "请输入标题" },
      },
      {
        formItem: { name: "content", label: "内容" },
        component: {
          is: "ATextarea",
          placeholder: "请输入内容",
          rows: 4,
        },
      },
    ],
  });
  promise.then((data) => AMessage.success(`备注已保存：${data.title}`));
};

// ──────────────────────────────────────────────────────────────
// 16. Form 级插槽（prefix / suffix）
// ──────────────────────────────────────────────────────────────
const handleModal11 = () => {
  const { promise } = createFormModal<LoginForm>({
    model: { title: "Form 插槽示例" },
    form: {
      layout: "vertical",
      slots: {
        prefix: () =>
          h(
            "p",
            { style: "color: #999; margin-bottom: 16px" },
            "请填写以下信息",
          ),
        suffix: () =>
          h("p", { style: "color: #999; margin-top: 8px" }, "带 * 为必填项"),
      },
    },
    fields: [
      {
        formItem: { name: "username", label: "用户名", required: true },
        component: { is: "AInput", placeholder: "请输入用户名" },
      },
    ],
  });
  promise.then((data) => AMessage.success(`提交成功：${data.username}`));
};

// ──────────────────────────────────────────────────────────────
// 17. FormItem 级插槽（extra）
// ──────────────────────────────────────────────────────────────
const handleModal12 = () => {
  const { promise } = createFormModal<LoginForm>({
    model: { title: "FormItem 插槽示例" },
    fields: [
      {
        formItem: {
          name: "username",
          label: "用户名",
          slots: {
            extra: () => h("span", { style: "color: #999" }, "4-20位字母数字"),
          },
        },
        component: {
          is: "AInput",
          placeholder: "请输入用户名",
          slots: {
            suffix: () => h("span", "👤"),
          },
        },
      },
    ],
  });
  promise.then((data) => AMessage.success(`提交成功：${data.username}`));
};
</script>

<template>
  <div class="test-container">
    <h2>FilterForm 筛选组件示例</h2>

    <!-- 1. 基础用法 -->
    <div class="demo-section">
      <h3>1. 基础用法（inline 布局 + 联动显示隐藏）</h3>
      <FilterForm
        :fields="filterFields"
        @search="handleFilterSearch"
        @reset="handleFilterReset"
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

    <h2>createFormModal / createFormDrawer 功能示例</h2>

    <a-space direction="vertical" style="width: 100%">
      <h3>基础功能</h3>
      <a-space wrap>
        <AButton type="primary" @click="handleModal1">1. 基本 Modal</AButton>
        <AButton @click="handleDrawer1">2. 基本 Drawer</AButton>
        <AButton @click="handleModal2">3. 初始值 + 校验</AButton>
        <AButton @click="handleDrawer2">4. visible 显隐 + 动态校验</AButton>
      </a-space>

      <h3>事件与联动</h3>
      <a-space wrap>
        <AButton @click="handleModal3">5. 事件拦截联动</AButton>
        <AButton @click="handleModal4">6. models 多重绑定</AButton>
        <AButton @click="handleDrawer3">7. Checkbox/Switch</AButton>
      </a-space>

      <h3>布局与排版</h3>
      <a-space wrap>
        <AButton @click="handleModal5">8. 栅格排版</AButton>
        <AButton @click="handleModal6">9. 动态 fields</AButton>
      </a-space>

      <h3>自定义插槽</h3>
      <a-space wrap>
        <AButton @click="handleModal7">10. 自定义 Modal footer</AButton>
        <AButton @click="handleDrawer4">11. 自定义 Drawer footer</AButton>
        <AButton @click="handleModal11">12. Form 插槽</AButton>
        <AButton @click="handleModal12">13. FormItem 插槽</AButton>
      </a-space>

      <h3>异步与控制</h3>
      <a-space wrap>
        <AButton @click="handleModal8">14. 异步提交（验证码1234）</AButton>
        <AButton @click="handleModal9">15. 主动关闭</AButton>
        <AButton @click="handleModal10">16. 处理取消</AButton>
        <AButton @click="handleDrawer5">17. Textarea</AButton>
      </a-space>
    </a-space>
  </div>
</template>

<style scoped>
.test-container {
  padding: 24px;
  max-width: 1000px;
}

.test-container h2 {
  margin-bottom: 24px;
}

.test-container h3 {
  margin-top: 16px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
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
