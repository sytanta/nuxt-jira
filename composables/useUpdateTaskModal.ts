const useUpdateProjectModal = () => {
  const {
    value: updateProjectModalOpen,
    setQueryValue: setUpdateProjectModalOpen,
  } = useUrlQuery("update_task");

  const isOpen = computed(() => !!updateProjectModalOpen.value);

  const open = (taskId: string) => setUpdateProjectModalOpen(taskId);
  const close = () => setUpdateProjectModalOpen(null);

  return {
    isOpen,
    open,
    close,
  };
};

export default useUpdateProjectModal;
