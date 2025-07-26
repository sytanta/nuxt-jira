import { createVNode, render, type Component } from "vue";

export default function useComponentToString() {
  const instance = getCurrentInstance();
  const appContext = instance?.appContext || null;

  const componentToString: (
    component: Component,
    props?: Record<string, any>,
  ) => string = (component, props = {}) => {
    // Create container
    const container = document.createElement("div");

    // Create VNode and render (stays within current app context)
    const vnode = createVNode(component, props);

    // This keeps the component in the same app context
    vnode.appContext = appContext;

    render(vnode, container);

    return container.innerHTML;
  };

  return { componentToString };
}
