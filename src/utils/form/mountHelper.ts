import { createApp } from "vue";
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

  let settled = false;

  const close = () => {
    app._instance?.exposed?.setOpen(false);
  };

  const validate = () => {
    const exposed = app._instance?.exposed;
    if (exposed?.validate) {
      return exposed.validate();
    }
    return Promise.reject(new Error("表单实例未就绪"));
  };

  // 暴露给容器组件的回调
  const containerProps = {
    ...props,
    formState,
    onClosed: () => {
      if (cleanedUp) return;
      cleanedUp = true;
      app.unmount();
      container.remove();
    },
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

  let cleanedUp = false;

  const app = createApp(containerComponent, containerProps);

  app.mount(container);

  return {
    promise,
    close,
    validate,
    formState,
  } as FormDialogReturn<T>;
};
