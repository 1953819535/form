<script setup lang="ts">
import { h } from "vue";
import { Button as AButton, message as AMessage } from "antdv-next";
import {
  createFormModal,
  createFormDrawer,
  type FormField,
} from "@/utils/form";

// ─── 1. 基本 Modal ────────────────────────────────
interface LoginForm {
  username: string;
  password: string;
}

const handleModal1 = () => {
  const { promise } = createFormModal<LoginForm>({
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
  promise.then((data) => AMessage.success(`登录成功：${data.username}`));
};

// ─── 2. 基本 Drawer（自带底部按钮）────────────────
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

// ─── 3. 带校验 ──────────────────────────────────────
interface UserForm {
  name: string;
  email: string;
  role: "admin" | "user";
}

const handleModal2 = () => {
  const { promise } = createFormModal<UserForm>({
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
  promise.then((data) => AMessage.success(`用户 ${data.name} 保存成功`));
};

// ─── 4. visible 显隐 + Drawer ────────────────────────
interface ContactForm {
  type: "personal" | "business";
  name: string;
  company: string;
}

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

// ─── 5. 自定义 Modal footer ──────────────────────────
const handleModal3 = () => {
  const { promise } = createFormModal<LoginForm>({
    model: {
      title: "自定义 footer",
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
                () => "确认提交",
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

// ─── 6. 自定义 Drawer footer ──────────────────────────
const handleDrawer3 = () => {
  const { promise } = createFormDrawer<LoginForm>({
    drawer: {
      title: "自定义 footer",
      placement: "right",
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

// ─── 7. onSubmit 异步提交 ─────────────────────────────
interface RegisterForm {
  email: string;
  code: string;
}

const handleModal4 = () => {
  const { promise } = createFormModal<RegisterForm>({
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
      await new Promise((r) => setTimeout(r, 1000));
      if (formData.code !== "1234") {
        throw new Error("验证码错误");
      }
    },
  });
  promise.then((data) => AMessage.success(`注册成功：${data.email}`));
};

// ─── 8. 主动关闭 ──────────────────────────────────────
const handleClose = () => {
  const { promise, close } = createFormModal<LoginForm>({
    model: { title: "3 秒后自动关闭" },
    fields: [
      {
        formItem: { name: "username", label: "用户名" },
        component: { is: "AInput", placeholder: "请输入用户名" },
      },
    ],
  });

  setTimeout(() => close(), 3000);

  promise
    .then((data) => AMessage.success(`提交成功：${data.username}`))
    .catch(() => AMessage.info("弹窗已关闭"));
};
</script>

<template>
  <div
    style="
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 480px;
    "
  >
    <h3>createFormModal 示例</h3>
    <AButton type="primary" @click="handleModal1">1. 基本 Modal</AButton>
    <AButton @click="handleModal2">2. 带校验</AButton>
    <AButton @click="handleModal3">3. 自定义 Modal footer</AButton>
    <AButton @click="handleModal4">4. 异步提交</AButton>
    <AButton @click="handleClose">5. 主动关闭</AButton>

    <h3 style="margin-top: 16px">createFormDrawer 示例</h3>
    <AButton @click="handleDrawer1">6. 基本 Drawer（自带按钮）</AButton>
    <AButton @click="handleDrawer2">7. visible 显隐 + 动态校验</AButton>
    <AButton @click="handleDrawer3">8. 自定义 Drawer footer</AButton>
  </div>
</template>
