import React, { useMemo, useState } from 'react';
import { ListView } from '@/components/refine-ui/views/list-view';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { Search, Pencil, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateButton } from '@/components/refine-ui/buttons/create';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { useTable } from '@refinedev/react-table';
import { useList, useDelete, useNavigation, useGetIdentity } from '@refinedev/core';
import { Subject, Department } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const SubjectList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
    const { edit } = useNavigation();
    const { mutate: deleteOne } = useDelete();
    const { data: identity } = useGetIdentity<{ role: string }>();
    const isAdmin = identity?.role === 'admin';

    // Fetch departments for filter dropdown
    const deptQuery = useList<Department>({
        resource: 'departments',
        pagination: { pageSize: 200 },
        queryOptions: { retry: false, refetchOnWindowFocus: false, staleTime: 60000 },
    });
    const departments = deptQuery.query.data?.data ?? [];
    const deptLoading = deptQuery.query.isLoading;

    const permanentFilters = useMemo(() => {
        const filters = [];
        if (selectedDepartment !== 'all') {
            filters.push({
                field: 'department',
                operator: 'eq' as const,
                value: selectedDepartment, // now passes dept.name — matches backend ilike on name
            });
        }
        if (searchQuery) {
            filters.push({
                field: 'name',
                operator: 'contains' as const,
                value: searchQuery,
            });
        }
        return filters;
    }, [selectedDepartment, searchQuery]);

    const subjectTable = useTable<Subject>({
        columns: useMemo<ColumnDef<Subject>[]>(() => {
            const cols: ColumnDef<Subject>[] = [
                {
                    id: 'code',
                    accessorKey: 'code',
                    size: 100,
                    header: () => <p className="column-title ml-2">Code</p>,
                    cell: ({ getValue }) => <Badge>{getValue<string>()}</Badge>,
                },
                {
                    id: 'name',
                    accessorKey: 'name',
                    size: 220,
                    header: () => <p className="column-title">Name</p>,
                    cell: ({ getValue }) => <span className="font-medium text-foreground">{getValue<string>()}</span>,
                    filterFn: 'includesString',
                },
                {
                    id: 'department',
                    accessorKey: 'department',
                    size: 160,
                    header: () => <p className="column-title">Department</p>,
                    cell: ({ getValue }) => {
                        const val = getValue<any>();
                        const deptName = typeof val === 'object' ? val?.name : val;
                        return <Badge variant="secondary">{deptName || '—'}</Badge>;
                    },
                },
                {
                    id: 'description',
                    accessorKey: 'description',
                    size: 280,
                    header: () => <p className="column-title">Description</p>,
                    cell: ({ getValue }) => (
                        <span className="text-sm text-muted-foreground truncate line-clamp-1">
                            {getValue<string>() || '—'}
                        </span>
                    ),
                },
            ];

            if (isAdmin) {
                cols.push({
                    id: 'actions',
                    size: 120,
                    header: () => <p className="column-title">Actions</p>,
                    cell: ({ row }) => (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => edit('subjects', row.original.id)}
                            >
                                <Pencil className="h-3 w-3 mr-1" />
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => setDeleteTarget(row.original)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ),
                });
            }

            return cols;
        }, [edit, isAdmin]),
        refineCoreProps: {
            resource: 'subjects',
            pagination: { pageSize: 10, mode: 'server' },
            filters: { permanent: permanentFilters },
            queryOptions: { retry: false, refetchOnWindowFocus: false, staleTime: 10000 },
            sorters: { initial: [{ field: 'id', order: 'desc' }] },
        },
    });

    const handleDelete = () => {
        if (!deleteTarget) return;
        deleteOne(
            { resource: 'subjects', id: deleteTarget.id },
            { onSettled: () => setDeleteTarget(null) }
        );
    };

    return (
        <ListView>
            <Breadcrumb />
            <h1 className="page-title">Subjects</h1>

            <div className="intro-row">
                <p className="text-muted-foreground">Manage academic subjects and their department assignments.</p>

                <div className="action-row">
                    <div className="search-field">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search subjects..."
                            className="pl-10 w-full border border-border rounded-md p-1 bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder={deptLoading ? 'Loading...' : 'Filter by department'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map((dept) => (
                                    <SelectItem value={dept.name} key={dept.id}>
                                        <span className="font-mono text-xs text-muted-foreground mr-2">{dept.code}</span>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isAdmin && <CreateButton resource="subjects" />}
                    </div>
                </div>
            </div>

            <DataTable table={subjectTable} />

            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
                            Subjects with associated classes cannot be deleted — remove the classes first.
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

export default SubjectList;