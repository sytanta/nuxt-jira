const useCreateProjectModal = () => {
  const {
    value: createProjectModalOpen,
    setQueryValue: setCreateProjectModalOpen,
  } = useUrlQuery("create_project");

  const isOpen = computed(() => createProjectModalOpen.value === "1");

  const open = () => setCreateProjectModalOpen(String(1));
  const close = () => setCreateProjectModalOpen(null);

  return {
    isOpen,
    open,
    close,
  };
};

export default useCreateProjectModal;
