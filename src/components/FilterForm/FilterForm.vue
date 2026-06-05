<script setup lang="ts">
import { h, ref, computed, watch, toRaw } from "vue";
import {
  Button as AButton,
  Form as AForm,
  FormItem as AFormItem,
  Row as ARow,
  Col as ACol,
  Space as ASpace,
} from "antdv-next";
import { DownOutlined, UpOutlined } from "@ant-design/icons-vue";
import RenderForm from "@/utils/form/renderForm";
import type { FilterField } from "./FilterForm.types";

// ── Props ──
const props = withDefaults(
  defineProps<{
    fields: FilterField<any>[] | ((formData: any) => FilterField<any>[]);
    modelValue?: Record<string, any>;
    initialValues?: Record<string, any>;
    loading?: boolean;
    layout?: "inline" | "grid";
    columns?: number;
    rowGutter?: number;
    colGutter?: number;
    collapsed?: boolean;
    defaultCollapseCount?: number;
    showCollapseButton?: boolean;
    showSearchButton?: boolean;
    showResetButton?: boolean;
    searchButtonText?: string;
    resetButtonText?: string;
    buttonColSpan?: number;
    debounce?: number | false;
  }>(),
  {
    layout: "inline",
    columns: 4,
    rowGutter: 16,
    colGutter: 16,
    collapsed: true,
    defaultCollapseCount: 3,
    showCollapseButton: true,
    showSearchButton: true,
    showResetButton: true,
    searchButtonText: "搜索",
    resetButtonText: "重置",
    debounce: 300,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: any];
  search: [value: any];
  reset: [value: any];
  collapseChange: [collapsed: boolean];
}>();

// ── 筛选值状态 ──
const formData = ref<Record<string, any>>({
  ...(props.initialValues || {}),
});

// 比较两个对象是否相等（浅比较）
const isEqual = (a: any, b: any) => {
  if (a === b) return true;
  if (!a || !b) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => a[key] === b[key]);
};

// 监听 modelValue 变化（受控模式）
watch(
  () => props.modelValue,
  (val) => {
    if (val !== undefined && !isEqual(val, formData.value)) {
      formData.value = { ...val };
    }
  },
  { deep: true },
);

// 监听 formData 变化，触发 update:modelValue
watch(
  formData,
  (val) => {
    if (!isEqual(val, props.modelValue)) {
      emit("update:modelValue", toRaw(val));
    }
  },
  { deep: true },
);

// ── 展开收起状态 ──
const collapsed = ref(props.collapsed);

// 监听 collapsed prop 变化
watch(
  () => props.collapsed,
  (val) => {
    if (val !== undefined) {
      collapsed.value = val;
    }
  },
);

// ── 动态计算当前字段列表 ──
const currentFields = computed(() => {
  const fields =
    typeof props.fields === "function"
      ? props.fields(formData.value)
      : props.fields;

  // 根据 visible 过滤
  return fields.filter((field: FilterField<any>) => {
    if (field.visible === undefined) return true;
    if (typeof field.visible === "boolean") return field.visible;
    return field.visible(formData.value);
  });
});

// ── 展开收起时显示的字段 ──
const visibleFields = computed(() => {
  if (!collapsed.value) return currentFields.value;
  return currentFields.value.slice(0, props.defaultCollapseCount);
});

// ── 是否需要展开收起按钮 ──
const needCollapseButton = computed(() => {
  return (
    props.showCollapseButton &&
    currentFields.value.length > props.defaultCollapseCount
  );
});

// ── 栅格布局计算 ──
const colSpan = computed(() => {
  return Math.floor(24 / props.columns);
});

const gutter = computed((): [number, number] => {
  if (props.layout !== "grid") return [0, 0];
  return [props.colGutter, props.rowGutter];
});

// ── 立即搜索 ──
const handleSearchImmediate = () => {
  emit("search", toRaw(formData.value));
};

// ── 重置 ──
const handleReset = () => {
  formData.value = {
    ...(props.initialValues || {}),
  };
  emit("reset", toRaw(formData.value));
};

// ── 切换展开收起 ──
const toggleCollapse = () => {
  collapsed.value = !collapsed.value;
  emit("collapseChange", collapsed.value);
};

// ── 操作按钮区域 ──
const renderActions = () => {
  const buttons = [];

  if (props.showSearchButton) {
    buttons.push(
      h(
        AButton,
        {
          type: "primary",
          loading: props.loading,
          onClick: handleSearchImmediate,
        },
        () => props.searchButtonText,
      ),
    );
  }

  if (props.showResetButton) {
    buttons.push(
      h(AButton, { onClick: handleReset }, () => props.resetButtonText),
    );
  }

  if (needCollapseButton.value) {
    buttons.push(
      h(AButton, { type: "link", onClick: toggleCollapse }, () => [
        collapsed.value ? "展开" : "收起",
        h(collapsed.value ? DownOutlined : UpOutlined),
      ]),
    );
  }

  return buttons;
};
</script>

<template>
  <div class="filter-form">
    <AForm :model="formData" layout="inline">
      <!-- 栅格布局 -->
      <ARow v-if="layout === 'grid'" :gutter="gutter" style="width: 100%">
        <ACol
          v-for="field in visibleFields"
          :key="field.formItem.name"
          :span="field.col?.span ?? colSpan"
        >
          <RenderForm :form-state="formData" :fields="[field]" />
        </ACol>

        <!-- 操作按钮 -->
        <ACol :span="buttonColSpan ?? colSpan" class="filter-form-actions">
          <ASpace>
            <slot
              name="actions"
              :search="handleSearchImmediate"
              :reset="handleReset"
            >
              <template v-for="btn in renderActions()" :key="btn">
                <component :is="() => btn" />
              </template>
            </slot>
          </ASpace>
        </ACol>
      </ARow>

      <!-- inline 布局 -->
      <template v-else>
        <template v-for="field in visibleFields" :key="field.formItem.name">
          <RenderForm :form-state="formData" :fields="[field]" />
        </template>

        <AFormItem class="filter-form-actions-inline">
          <ASpace :size="8">
            <slot
              name="actions"
              :search="handleSearchImmediate"
              :reset="handleReset"
            >
              <template v-for="btn in renderActions()" :key="btn">
                <component :is="() => btn" />
              </template>
            </slot>
          </ASpace>
        </AFormItem>
      </template>
    </AForm>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "FilterForm",
});
</script>

<style scoped>
.filter-form {
  margin-bottom: 16px;
}

.filter-form :deep(.ant-form-item) {
  margin-right: 16px;
}

.filter-form-actions {
  display: flex;
  align-items: flex-end;
  padding-bottom: 24px;
}

.filter-form-actions-inline {
  margin-bottom: 0;
}
</style>
