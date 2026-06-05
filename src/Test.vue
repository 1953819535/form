<script setup lang="ts">
import { h } from "vue";
import { Button as AButton, message as AMessage } from "antdv-next";
import {
  createFormModal,
  createFormDrawer,
  type FormField,
} from "@/utils/form";
import FullName from "@/components/FullName.vue";

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
  max-width: 800px;
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
</style>
