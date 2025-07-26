import type { Models } from "node-appwrite";
import { type ColumnDef } from "@tanstack/vue-table";
import { ArrowUpDownIcon } from "lucide-vue-next";

import { TaskStatus, type FilteredTask } from "~/lib/types";
import { Badge, Button, Icon, ProjectAvatar, TaskDate } from "#components";
import MemberAvatar from "../workspace/member/MemberAvatar.vue";
import Actions from "./Actions.vue";

const statuses = Object.entries(TaskStatus).reduce(
  (acc, [label, value]) => {
    acc[value] = label;
    return acc;
  },
  {} as Record<string, string>,
);

export const columns: ColumnDef<FilteredTask>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Task name", h(ArrowUpDownIcon, { class: "ml-2 h-4 w-4" })],
      );
    },
    cell: ({ row }) => h("p", { class: "line-clamp-1" }, row.getValue("name")),
  },
  {
    accessorKey: "project",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Project", h(ArrowUpDownIcon, { class: "ml-2 h-4 w-4" })],
      );
    },
    cell: ({ row }) => {
      const project = row.getValue("project") as Models.Document;
      return h(
        "div",
        { class: "flex items-center gap-x-2 text-sm font-medium" },
        [
          h(ProjectAvatar, {
            name: project.name,
            class: "size-6",
            image: project.image_url,
          }),
          h("p", { class: "line-clamp-1" }, project.name),
        ],
      );
    },
  },
  {
    accessorKey: "assignee",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Assignee", h(ArrowUpDownIcon, { class: "ml-2 h-4 w-4" })],
      );
    },
    cell: ({ row }) => {
      const assignee = row.getValue("assignee") as Models.Document;
      return h(
        "div",
        { class: "flex items-center gap-x-2 text-sm font-medium" },
        [
          h(MemberAvatar, {
            name: assignee.name,
            class: "size-6",
            fallbackClass: "text-xs",
          }),
          h("p", { class: "line-clamp-1" }, assignee.name),
        ],
      );
    },
  },
  {
    accessorKey: "due_date",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Due Date", h(ArrowUpDownIcon, { class: "ml-2 h-4 w-4" })],
      );
    },
    cell: ({ row }) => {
      const dueDate = row.getValue("due_date") as string;
      return h(
        "div",
        { class: "flex items-center gap-x-2 text-sm font-medium" },
        h(TaskDate, { value: dueDate }),
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Status", h(ArrowUpDownIcon, { class: "ml-2 h-4 w-4" })],
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as TaskStatus;
      return h(
        "div",
        { class: "flex items-center gap-x-2 text-sm font-medium" },
        h(Badge, { variant: status }, () => statuses[status]),
      );
    },
  },
  {
    id: "actions",
    accessorKey: "task_id",
    header: () => null,
    cell: ({ row }) => {
      const id = row.original.$id;
      const name = row.original.name;
      const projectId = row.original.project.$id;

      return h(Actions, { taskId: id, name, projectId }, () =>
        h(Button, { variant: "ghost", class: "size-8 p-0" }, () =>
          h(Icon, {
            name: "lucide:ellipsis-vertical",
            size: "16px",
            class: "size-4",
          }),
        ),
      );
    },
  },
];
