import type { Component } from "vue";
import {
  Input as AInput,
  Select as ASelect,
  Checkbox as ACheckbox,
  RadioGroup as ARadioGroup,
  Switch as ASwitch,
  DatePicker as ADatePicker,
} from "antdv-next";
import type { SlotRender, ComponentLike, SlotScope } from "./types";

// ──────────────────────────────────────────────────────────────
// 常用组件映射表
// ──────────────────────────────────────────────────────────────
export const componentMap: Record<string, Component> = {
  AInput,
  ASelect,
  ACheckbox,
  ARadioGroup,
  ASwitch,
  ATextarea: AInput.TextArea,
  ADatePicker,
  ARangePicker: ADatePicker.RangePicker,
};

// ──────────────────────────────────────────────────────────────
// 插槽格式化转换工具
// ──────────────────────────────────────────────────────────────
export const normalizeSlots = (slotsConfig?: Record<string, any>) => {
  if (!slotsConfig) return undefined;
  const normalized: Record<string, any> = {};
  Object.entries(slotsConfig).forEach(([key, val]) => {
    normalized[key] = typeof val === "function" ? val : (...args: any[]) => val;
  });
  return normalized;
};

// ──────────────────────────────────────────────────────────────
// 解析组件标识
// ──────────────────────────────────────────────────────────────
export const resolveComponent = (is: ComponentLike): Component => {
  if (typeof is === "string" && is in componentMap) {
    return componentMap[is as keyof typeof componentMap]!;
  }
  return is as Component;
};

// ──────────────────────────────────────────────────────────────
// 处理容器插槽：注入 slotScope
// ──────────────────────────────────────────────────────────────
export const processSlotsWithScope = (
  resolvedSlots: Record<string, any>,
  slotScope: SlotScope<any>,
): Record<string, any> => {
  const processed: Record<string, any> = {};
  Object.entries(resolvedSlots).forEach(([key, renderFn]) => {
    processed[key] = (...args: any[]) => {
      return (renderFn as Function)(slotScope, ...args);
    };
  });
  return processed;
};
