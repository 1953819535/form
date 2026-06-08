<script setup lang="ts">
definePage({
  meta: {
    title: "Drawer 表单",
    requiresAuth: true,
    order: 3, // 子菜单排序
  },
});

import { h } from "vue";
import { Button as AButton, message as AMessage } from "antdv-next";
import { createFormDrawer } from "@/utils/form";

// ──────────────────────────────────────────────────────────────
// 类型定义
// ──────────────────────────────────────────────────────────────
interface LoginForm {
  username: string;
  password: string;
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

interface RemarkForm {
  title: string;
  content: string;
}

// ──────────────────────────────────────────────────────────────
// 1. 基本 Drawer
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
// 2. visible 显隐控制 + 动态校验
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
// 3. Checkbox / Switch（modelPropName）
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
// 4. 自定义 Drawer footer
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
// 5. Textarea 组件
// ──────────────────────────────────────────────────────────────
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
</script>

<template>
  <div class="page-container">
    <h2>createFormDrawer 抽屉表单示例</h2>

    <a-space direction="vertical" style="width: 100%">
      <h3>基础功能</h3>
      <a-space wrap>
        <AButton type="primary" @click="handleDrawer1">1. 基本 Drawer</AButton>
        <AButton @click="handleDrawer2">2. visible 显隐 + 动态校验</AButton>
      </a-space>

      <h3>特殊组件</h3>
      <a-space wrap>
        <AButton @click="handleDrawer3">3. Checkbox/Switch</AButton>
        <AButton @click="handleDrawer5">4. Textarea</AButton>
      </a-space>

      <h3>自定义</h3>
      <a-space wrap>
        <AButton @click="handleDrawer4">5. 自定义 Drawer footer</AButton>
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