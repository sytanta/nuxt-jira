<script setup lang="ts" generic="TData, TValue">
import { useQueryClient } from '@tanstack/vue-query';
import type {
    ColumnDef,
    ColumnFiltersState,
    SortingState
} from '@tanstack/vue-table'
import {
    FlexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useVueTable,
} from '@tanstack/vue-table'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { valueUpdater } from '~/lib/utils';

const props = defineProps<{
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}>()

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])

const table = useVueTable({
    get data() { return props.data },
    get columns() { return props.columns },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
    onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
        get sorting() { return sorting.value },
        get columnFilters() { return columnFilters.value },
    },
})
</script>

<template>
    <div>
        <div class="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                        <TableHead v-for="header in headerGroup.headers" :key="header.id">
                            <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
                                :props="header.getContext()" />
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="table.getRowModel().rows?.length">
                        <TableRow v-for="row in table.getRowModel().rows" :key="row.id"
                            :data-state="row.getIsSelected() ? 'selected' : undefined">
                            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                            </TableCell>
                        </TableRow>
                    </template>
                    <template v-else>
                        <TableRow>
                            <TableCell :colspan="columns.length" class="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    </template>
                </TableBody>
            </Table>
        </div>
        <div class="flex items-center justify-end py-4 space-x-2">
            <Button variant="secondary" size="sm" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()">
                Previous
            </Button>
            <Button variant="secondary" size="sm" :disabled="!table.getCanNextPage()" @click="table.nextPage()">
                Next
            </Button>
        </div>
    </div>
</template>