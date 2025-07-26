const useCreateWorkspaceModal = () => {
  const {
    value: createWorkspaceModalOpen,
    setQueryValue: setCreateWorkspaceModalOpen,
  } = useUrlQuery("create_workspace");

  const isOpen = computed(() => createWorkspaceModalOpen.value === "1");

  const open = () => setCreateWorkspaceModalOpen(String(1));
  const close = () => setCreateWorkspaceModalOpen(null);

  return {
    isOpen,
    open,
    close,
  };
};

export default useCreateWorkspaceModal;
