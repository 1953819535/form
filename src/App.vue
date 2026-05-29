<script setup lang="ts">
import { h } from "vue";
import { Button as AButton, message as AMessage } from "antdv-next";
import { createForm, useCreateForm, type FormField } from "@/utils/form";
import FullName from "@/components/FullName.vue";

// ─── 1. 基础用法 ───────────────────────────────────────────
interface LoginForm {
  username: string;
  password: string;
}

const handleBasic = () => {
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
  promise.then((data) => {
    AMessage.success(`登录成功：${data.username}`);
  });
};

// ─── 2. 带初始值和校验规则 ─────────────────────────────────
interface UserForm {
  name: string;
  email: string;
  role: "admin" | "user";
}

const handleValidation = () => {
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
  promise.then((data) => {
    AMessage.success(`用户 ${data.name} 保存成功`);
  });
};

// ─── 3. 动态字段 — 条件显示 ─────────────────────────────────
interface ContactForm {
  type: "personal" | "business";
  name: string;
  company: string;
}

const handleDynamicFields = () => {
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
  promise.then((data) => {
    AMessage.success(`联系人 ${data.name} 添加成功`);
  });
};

// ─── 4. 字段级 visible 显隐控制 ─────────────────────────────
const handleVisible = () => {
  const { promise } = createForm<ContactForm>({
    model: { title: "添加联系人（visible 显隐）" },
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
  promise.then((data) => {
    AMessage.success(`联系人 ${data.name} 添加成功`);
  });
};

// ─── 5. 动态校验规则 ───────────────────────────────────────
const handleDynamicRules = () => {
  const { promise } = createForm<ContactForm>({
    model: { title: "添加联系人（动态校验）" },
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
  promise.then((data) => {
    AMessage.success(`联系人 ${data.name} 添加成功`);
  });
};

// ─── 6. 事件拦截 — 表单联动 ─────────────────────────────────
interface LinkageForm {
  role: "admin" | "user";
  nickname: string;
  memo: string;
}

const handleEventLinkage = () => {
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
};

// ─── 7. 多重双向绑定 — models ───────────────────────────────
interface NameForm {
  firstName: string;
  lastName: string;
}

const handleModels = () => {
  const { promise } = createForm<NameForm>({
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
  promise.then((data) => {
    AMessage.success(`${data.firstName} ${data.lastName}`);
  });
};

// ─── 8. 自定义 modelPropName（Checkbox / Switch）───────────
interface SettingsForm {
  enabled: boolean;
  notify: boolean;
}

const handleCustomModelProp = () => {
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
  promise.then((data) => {
    AMessage.success(`启用：${data.enabled}，通知：${data.notify}`);
  });
};

// ─── 9. 栅格排版 ───────────────────────────────────────────
interface GridForm {
  firstName: string;
  lastName: string;
  email: string;
}

const handleGrid = () => {
  const { promise } = createForm<GridForm>({
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
  promise.then((data) => {
    AMessage.success(`${data.firstName} ${data.lastName} / ${data.email}`);
  });
};

// ─── 10. 插槽自定义（含 slotScope）──────────────────────────
interface SlotForm {
  username: string;
}

const handleSlots = () => {
  const { promise } = createForm<SlotForm>({
    model: {
      title: "插槽示例",
      // Modal footer 插槽自动注入 { formData, submit, cancel, loading }
      slots: {
        footer: ({ submit, cancel, loading }) =>
          h("div", { style: "display: flex; justify-content: flex-end; gap: 8px" }, [
            h(AButton, { onClick: cancel }, "取消"),
            h(AButton, { type: "primary", onClick: submit, loading }, "确认提交"),
          ]),
      },
    },
    form: {
      layout: "vertical",
      slots: {
        prefix: () => h("p", { style: "color: #999; margin-bottom: 16px" }, "请填写以下信息"),
        suffix: () => h("p", { style: "color: #999; margin-top: 8px" }, "带 * 为必填项"),
      },
    },
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
            suffix: () => h("span", "\u{1F464}"),
          },
        },
      },
    ],
  });
};

// ─── 11. CreateFormReturn — 外部控制表单 ────────────────────
interface ControlForm {
  username: string;
  email: string;
}

const handleControl = () => {
  const { promise, close, validate, formState, formRef } = createForm<ControlForm>({
    model: { title: "外部控制表单" },
    initialValues: { username: "", email: "" },
    fields: [
      {
        formItem: { name: "username", label: "用户名" },
        component: { is: "AInput", placeholder: "请输入用户名" },
      },
      {
        formItem: { name: "email", label: "邮箱" },
        component: { is: "AInput", placeholder: "请输入邮箱" },
      },
    ],
  });

  // 演示：3秒后自动关闭
  setTimeout(() => {
    close();
  }, 3000);

  promise.then((data) => {
    AMessage.success(`提交成功：${data.username}`);
  }).catch(() => {
    AMessage.info("弹窗已关闭");
  });
};

// ─── 12. useCreateForm — Composition API ────────────────────
const { showForm } = useCreateForm();

const handleUseCreateForm = () => {
  const { promise } = showForm<LoginForm>({
    model: { title: "useCreateForm（自动注入上下文）" },
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
  promise.then((data) => {
    AMessage.success(`登录成功：${data.username}`);
  });
};

// ─── 13. onSubmit 与错误处理 ─────────────────────────────────
interface RegisterForm {
  email: string;
  code: string;
}

const handleSubmitError = () => {
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
      await new Promise((r) => setTimeout(r, 1000));
      if (formData.code !== "1234") {
        throw new Error("验证码错误，请重新输入");
      }
    },
  });
  promise.then((data) => {
    AMessage.success(`注册成功：${data.email}`);
  });
};

// ─── 14. 处理用户取消 ──────────────────────────────────────
const handleCancel = () => {
  const { promise } = createForm<LoginForm>({
    model: { title: "取消示例" },
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
  promise
    .then((data) => {
      AMessage.success(`提交成功：${data.username}`);
    })
    .catch(() => {
      AMessage.info("用户取消了操作");
    });
};
</script>

<template>
  <div style="padding: 24px; display: flex; flex-direction: column; gap: 12px; max-width: 480px">
    <h3>createForm 示例</h3>
    <AButton @click="handleBasic">1. 基础用法</AButton>
    <AButton @click="handleValidation">2. 校验规则</AButton>
    <AButton @click="handleDynamicFields">3. 动态字段（条件显示）</AButton>
    <AButton @click="handleVisible">4. visible 显隐控制</AButton>
    <AButton @click="handleDynamicRules">5. 动态校验规则</AButton>
    <AButton @click="handleEventLinkage">6. 事件拦截联动</AButton>
    <AButton @click="handleModels">7. models 多重绑定</AButton>
    <AButton @click="handleCustomModelProp">8. 自定义 modelPropName</AButton>
    <AButton @click="handleGrid">9. 栅格排版</AButton>
    <AButton @click="handleSlots">10. 插槽自定义（slotScope）</AButton>
    <AButton @click="handleControl">11. CreateFormReturn 外部控制</AButton>
    <AButton @click="handleUseCreateForm">12. useCreateForm</AButton>
    <AButton @click="handleSubmitError">13. onSubmit 错误处理</AButton>
    <AButton @click="handleCancel">14. 处理用户取消</AButton>
  </div>
</template>
