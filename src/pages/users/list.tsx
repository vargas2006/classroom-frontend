import React, { useMemo, useState } from 'react';
import { ListView } from '@/components/refine-ui/views/list-view';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { Search, Shield, BookOpen, GraduationCap, Trash2, Pencil, Eye } from 'lucide-react';
import { CreateButton } from '@/components/refine-ui/buttons/create';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { useTable } from '@refinedev/react-table';
import { User, UserRole } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDelete, useNavigation } from '@refinedev/core';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const roleVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
    admin: 'default',
    teacher: 'secondary',
    student: 'outline',
};

const RoleIcon = ({ role }: { role: string }) => {
    if (role === 'admin') return <Shield className="h-3 w-3" />;
    if (role === 'teacher') return <BookOpen className="h-3 w-3" />;
    return <GraduationCap className="h-3 w-3" />;
};

const UserList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const { edit, show } = useNavigation();
    const { mutate: deleteOne } = useDelete();

    const permanentFilters = useMemo(() => {
        const filters = [];
        if (searchQuery) {
            filters.push({ field: 'name', operator: 'contains' as const, value: searchQuery });
        }
        if (selectedRole !== 'all') {
            filters.push({ field: 'role', operator: 'eq' as const, value: selectedRole });
        }
        return filters;
    }, [searchQuery, selectedRole]);

    const table = useTable<User>({
        columns: useMemo<ColumnDef<User>[]>(() => [
            {
                id: 'avatar',
                accessorKey: 'image',
                size: 60,
                header: () => <p className="column-title ml-2"></p>,
                cell: ({ getValue, row }) => {
                    const url = getValue<string | null>();
                    const initials = row.original.name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?';
                    return url ? (
                        <img src={url} alt={row.original.name} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                            {initials}
                        </div>
                    );
                },
            },
            {
                id: 'name',
                accessorKey: 'name',
                size: 200,
                header: () => <p className="column-title">Name</p>,
                cell: ({ getValue, row }) => (
                    <div>
                        <p className="font-medium text-foreground">{getValue<string>()}</p>
                        <p className="text-xs text-muted-foreground">{row.original.email}</p>
                    </div>
                ),
            },
            {
                id: 'role',
                accessorKey: 'role',
                size: 110,
                header: () => <p className="column-title">Role</p>,
                cell: ({ getValue }) => {
                    const role = getValue<string>();
                    return (
                        <Badge variant={roleVariant[role] ?? 'outline'} className="gap-1 capitalize">
                            <RoleIcon role={role} />
                            {role}
                        </Badge>
                    );
                },
            },
            {
                id: 'createdAt',
                accessorKey: 'createdAt',
                size: 150,
                header: () => <p className="column-title">Joined</p>,
                cell: ({ getValue }) => (
                    <span className="text-sm text-muted-foreground">
                        {new Date(getValue<string>()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                ),
            },
            {
                id: 'actions',
                size: 140,
                header: () => <p className="column-title">Actions</p>,
                cell: ({ row }) => (
                    <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => show('users', row.original.id)}>
                            <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => edit('users', row.original.id)}>
                            <Pencil className="h-3 w-3" />
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
            },
        ], [edit, show]),
        refineCoreProps: {
            resource: 'users',
            pagination: { pageSize: 10, mode: 'server' },
            filters: { permanent: permanentFilters },
            queryOptions: { retry: 1, refetchOnWindowFocus: false },
            sorters: { initial: [{ field: 'id', order: 'desc' }] },
        },
    });

    const handleDelete = () => {
        if (!deleteTarget) return;
        deleteOne(
            { resource: 'users', id: deleteTarget.id },
            { onSettled: () => setDeleteTarget(null) }
        );
    };

    return (
        <ListView>
            <Breadcrumb />
            <h1 className="page-title">Users</h1>

            <div className="intro-row">
                <p className="text-muted-foreground">Manage all admin, teacher, and student accounts.</p>

                <div className="action-row">
                    <div className="search-field">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="pl-10 w-full border border-border rounded-md p-1 bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                                <SelectItem value={UserRole.TEACHER}>Teacher</SelectItem>
                                <SelectItem value={UserRole.STUDENT}>Student</SelectItem>
                            </SelectContent>
                        </Select>
                        <CreateButton resource="users" />
                    </div>
                </div>
            </div>

            <DataTable table={table} />

            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
                            Teachers assigned to active classes cannot be deleted — reassign those classes first.
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

export default UserList;
