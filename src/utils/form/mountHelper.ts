import { createApp, ref } from "vue";
import type { FormDialogReturn } from "./types";

export const mountFormDialog = <T extends Record<string, any>>(
  containerComponent: any,
  props: Record<string, any>,
  formState: T,
): FormDialogReturn<T> => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  let resolvePromise: (data: T) => void;
  let rejectPromise: (err: Error) => void;

  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  const formRef = ref<any>();

  const validate = () => {
    if (formRef.value) {
      return formRef.value.validate();
    }
    return Promise.reject(new Error("表单实例未就绪"));
  };

  let settled = false;

  const close = () => {
    app._instance?.exposed?.setOpen(false);
  };

  // 暴露给容器组件的回调
  const containerProps = {
    ...props,
    formState,
    formRef,
    onClose: () => {
      if (!settled) {
        settled = true;
        rejectPromise(new Error("用户取消"));
      }
    },
    onResolve: (data: T) => {
      if (!settled) {
        settled = true;
        resolvePromise(data);
      }
    },
    onReject: (err: Error) => {
      if (!settled) {
        settled = true;
        rejectPromise(err);
      }
    },
  };

  const app = createApp(containerComponent, containerProps);

  app.mount(container);

  // 弹窗关闭后清理
  promise
    .catch(() => {})
    .finally(() => {
      setTimeout(() => {
        app.unmount();
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }, 300);
    });

  return {
    promise,
    close,
    validate,
    formState,
    formRef,
  };
};