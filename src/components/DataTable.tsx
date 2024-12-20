import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  ColumnDef,
} from '@tanstack/react-table';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  pageSize?: number;
}

export function DataTable<T>({ data, columns, pageSize = 10 }: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  console.log('data is => ', data);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full divide-y divide-gray-200 print:table print:w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => (
                  <th
                    key={header.id}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${
                      index === headerGroup.headers.length - 1 ? 'last-column' : ''
                    }`} // Adding a class to the last column
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      <span>
                        {header.column.getIsSorted() === 'asc' ? '↑' : ''}
                        {header.column.getIsSorted() === 'desc' ? '↓' : ''}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell, index) => (
                  <td
                    key={cell.id}
                    className={`px-6 py-4 whitespace-nowrap print:whitespace-normal  text-gray-500 ${
                      index === row.getVisibleCells().length - 1 ? 'last-column' : ''
                    }`} // Adding the same class to the last column
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <button
            className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
        <span className="text-sm text-gray-700">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
      </div>
    </div>
  );
}
