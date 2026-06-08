<script setup lang="ts">
definePage({
  meta: {
    title: "Modal 表单",
    requiresAuth: true,
    order: 2, // 子菜单排序
  },
});

import { h } from "vue";
import { Button as AButton, message as AMessage } from "antdv-next";
import { createFormModal, type FormField } from "@/utils/form";
import FullName from "@/components/FullName.vue";

// ──────────────────────────────────────────────────────────────
// 类型定义
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

interface LinkageForm {
  role: "admin" | "user";
  nickname: string;
  memo: string;
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

interface RegisterForm {
  email: string;
  code: string;
}

interface RemarkForm {
  title: string;
  content: string;
}

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
// 2. 带初始值和校验规则
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
// 3. 事件拦截联动
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
// 4. models 多重绑定
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
// 5. 栅格排版
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
// 6. 动态 fields（条件显示）
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
// 7. 自定义 Modal footer
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
// 8. Form 级插槽（prefix / suffix）
// ──────────────────────────────────────────────────────────────
const handleModal8 = () => {
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
// 9. FormItem 级插槽（extra）
// ──────────────────────────────────────────────────────────────
const handleModal9 = () => {
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

// ──────────────────────────────────────────────────────────────
// 10. onSubmit 异步提交（验证码：1234）
// ──────────────────────────────────────────────────────────────
const handleModal10 = () => {
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
// 11. 主动关闭 + validate 手动校验
// ──────────────────────────────────────────────────────────────
const handleModal11 = () => {
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
// 12. 处理用户取消
// ──────────────────────────────────────────────────────────────
const handleModal12 = () => {
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
</script>

<template>
  <div class="page-container">
    <h2>createFormModal 弹窗表单示例</h2>

    <a-space direction="vertical" style="width: 100%">
      <h3>基础功能</h3>
      <a-space wrap>
        <AButton type="primary" @click="handleModal1">1. 基本 Modal</AButton>
        <AButton @click="handleModal2">2. 初始值 + 校验</AButton>
      </a-space>

      <h3>事件与联动</h3>
      <a-space wrap>
        <AButton @click="handleModal3">3. 事件拦截联动</AButton>
        <AButton @click="handleModal4">4. models 多重绑定</AButton>
      </a-space>

      <h3>布局与排版</h3>
      <a-space wrap>
        <AButton @click="handleModal5">5. 栅格排版</AButton>
        <AButton @click="handleModal6">6. 动态 fields</AButton>
      </a-space>

      <h3>自定义插槽</h3>
      <a-space wrap>
        <AButton @click="handleModal7">7. 自定义 footer</AButton>
        <AButton @click="handleModal8">8. Form 插槽</AButton>
        <AButton @click="handleModal9">9. FormItem 插槽</AButton>
      </a-space>

      <h3>异步与控制</h3>
      <a-space wrap>
        <AButton @click="handleModal10">10. 异步提交（验证码1234）</AButton>
        <AButton @click="handleModal11">11. 主动关闭</AButton>
        <AButton @click="handleModal12">12. 处理取消</AButton>
      </a-space>
    </a-space>
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

.page-container h3 {
  margin-top: 16px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}
</style>