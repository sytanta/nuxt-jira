export const useTaskFilterQueries = () => {
  return useUrlQueries({
    project_id: parseAsString,
    status: parseAsString,
    search: parseAsString,
    assignee_id: parseAsString,
    due_date: parseAsString,
  });
};
