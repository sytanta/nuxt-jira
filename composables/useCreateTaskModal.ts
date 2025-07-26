const useCreateProjectModal = () => {
  const {
    value: createProjectModalOpen,
    setQueryValue: setCreateProjectModalOpen,
  } = useUrlQuery("create_task");

  const isOpen = computed(() => !!createProjectModalOpen.value);

  const open = (status?: string) =>
    setCreateProjectModalOpen(encodeURIComponent(status ?? 1));
  const close = () => setCreateProjectModalOpen(null);

  return {
    isOpen,
    open,
    close,
  };
};

export default useCreateProjectModal;
