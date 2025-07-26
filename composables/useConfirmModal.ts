import { createVNode, render, type Component } from "vue";

type Result = string | number | boolean;

/**
 * Programmatically open a confirm modal
 * @returns { openModal: () => Promise<any> }
 */
export default function useConfirmModal() {
  const instance = getCurrentInstance();
  const appContext = instance?.appContext || null;

  const openModal: (
    component: Component,
    props?: Record<string, any>
  ) => Promise<any> = (component, props = {}) => {
    return new Promise((resolve) => {
      // Create container
      const container = document.body;

      const { onConfirm, onClose, onCancel } = props;

      const open = ref(true);

      const closeModal = () => (open.value = false);

      const cleanup = () => {
        render(null, container);
      };

      // Enhanced props with cleanup
      const enhancedProps = {
        ...props,
        open,
        closeModal,
        onConfirm: async (result: Result) => {
          await onConfirm?.(result);
          resolve(result || true);
        },
        onCancel: async () => {
          await onCancel?.();
          resolve(false);
        },
        onClose: async (result: Result) => {
          await onClose?.();
          resolve(result);
        },
        cleanup,
      };

      // Create VNode and render (stays within current app context)
      const vnode = createVNode(component, enhancedProps);

      // This keeps the component in the same app context
      vnode.appContext = appContext;

      render(vnode, container);
    });
  };

  return { openModal };
}
