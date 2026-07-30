import React, { useMemo, useState } from 'react';
import { ListView } from '@/components/refine-ui/views/list-view';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { Search, Building2, Trash2, Pencil } from 'lucide-react';
import { CreateButton } from '@/components/refine-ui/buttons/create';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { useTable } from '@refinedev/react-table';
import { Department } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDelete, useNavigation, CanAccess } from '@refinedev/core';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const DepartmentList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
    const { edit } = useNavigation();
    const { mutate: deleteOne } = useDelete();

    const permanentFilters = useMemo(() => {
        const filters = [];
        if (searchQuery) {
            filters.push({ field: 'name', operator: 'contains' as const, value: searchQuery });
        }
        return filters;
    }, [searchQuery]);

    const table = useTable<Department>({
        columns: useMemo<ColumnDef<Department>[]>(() => [
            {
                id: 'code',
                accessorKey: 'code',
                size: 100,
                header: () => <p className="column-title ml-2">Code</p>,
                cell: ({ getValue }) => <Badge variant="outline" className="font-mono">{getValue<string>()}</Badge>,
            },
            {
                id: 'name',
                accessorKey: 'name',
                size: 220,
                header: () => <p className="column-title">Department Name</p>,
                cell: ({ getValue }) => (
                    <span className="flex items-center gap-2 font-medium text-foreground">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {getValue<string>()}
                    </span>
                ),
            },
            {
                id: 'description',
                accessorKey: 'description',
                size: 350,
                header: () => <p className="column-title">Description</p>,
                cell: ({ getValue }) => (
                    <span className="text-sm text-muted-foreground line-clamp-1">
                        {getValue<string>() || '—'}
                    </span>
                ),
            },
            {
                id: 'actions',
                size: 120,
                header: () => <p className="column-title">Actions</p>,
                cell: ({ row }) => (
                    <div className="flex gap-2">
                        <CanAccess resource="departments" action="edit">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => edit('departments', row.original.id)}
                            >
                                <Pencil className="h-3 w-3 mr-1" />
                                Edit
                            </Button>
                        </CanAccess>
                        <CanAccess resource="departments" action="delete">
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => setDeleteTarget(row.original)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </CanAccess>
                    </div>
                ),
            },
        ], [edit]),
        refineCoreProps: {
            resource: 'departments',
            pagination: { pageSize: 10, mode: 'server' },
            filters: { permanent: permanentFilters },
            queryOptions: { retry: 1, refetchOnWindowFocus: false },
            sorters: { initial: [{ field: 'id', order: 'desc' }] },
        },
    });

    const handleDelete = () => {
        if (!deleteTarget) return;
        deleteOne(
            { resource: 'departments', id: deleteTarget.id },
            { onSettled: () => setDeleteTarget(null) }
        );
    };

    return (
        <ListView>
            <Breadcrumb />
            <h1 className="page-title">Departments</h1>

            <div className="intro-row">
                <p className="text-muted-foreground">Manage academic departments and their associated subjects.</p>

                <div className="action-row">
                    <div className="search-field">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search departments..."
                            className="pl-10 w-full border border-border rounded-md p-1 bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <CreateButton resource="departments" />
                </div>
            </div>

            <DataTable table={table} />

            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Department</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
                            This action cannot be undone. Departments with subjects cannot be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDelete}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ListView>
    );
};

export default DepartmentList;
