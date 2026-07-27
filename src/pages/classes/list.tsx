import React, { useMemo, useState } from 'react';
import { ListView } from '@/components/refine-ui/views/list-view';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { Search } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CreateButton } from '@/components/refine-ui/buttons/create';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { useTable } from '@refinedev/react-table';
import { useList } from '@refinedev/core';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { ClassDetails, Subject, User } from '@/types';

const ClassList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [selectedTeacher, setSelectedTeacher] = useState('all');

    // ── Filter arrays passed to useTable ─────────────────────────────
    const searchFilters = searchQuery
        ? [{ field: 'name', operator: 'contains' as const, value: searchQuery }]
        : [];

    const subjectFilters =
        selectedSubject !== 'all'
            ? [{ field: 'subject', operator: 'eq' as const, value: selectedSubject }]
            : [];

    const teacherFilters =
        selectedTeacher !== 'all'
            ? [{ field: 'teacher', operator: 'eq' as const, value: selectedTeacher }]
            : [];

    // ── Fetch filter-dropdown options ─────────────────────────────────
    const subjectsQuery = useList<Subject>({
        resource: 'subjects',
        pagination: { pageSize: 200 },
    });

    const teachersQuery = useList<User>({
        resource: 'users',
        filters: [{ field: 'role', operator: 'eq', value: 'teacher' }],
        pagination: { pageSize: 200 },
    });

    const subjects = subjectsQuery.result?.data ?? [];
    const teachers = teachersQuery.result?.data ?? [];

    // ── Table Columns (in specified order) ─────────────────────────────
    // 1) Banner -> bannerUrl
    // 2) Class Name -> name
    // 3) Status -> status (Badge: active / inactive)
    // 4) Subject -> subject.name
    // 5) Teacher -> teacher.name
    // 6) Capacity -> capacity
    const classTable = useTable<ClassDetails>({
        columns: useMemo<ColumnDef<ClassDetails>[]>(
            () => [
                {
                    id: 'banner',
                    accessorKey: 'bannerUrl',
                    size: 80,
                    header: () => <p className="column-title ml-2">Banner</p>,
                    cell: ({ getValue }) => {
                        const url = getValue<string | null>();
                        return url ? (
                            <img
                                src={url}
                                alt="Class banner"
                                className="h-10 w-16 rounded object-cover"
                            />
                        ) : (
                            <div className="h-10 w-16 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                No img
                            </div>
                        );
                    },
                },
                {
                    id: 'name',
                    accessorKey: 'name',
                    size: 220,
                    header: () => <p className="column-title">Class Name</p>,
                    cell: ({ getValue }) => (
                        <span className="text-foreground font-medium">{getValue<string>()}</span>
                    ),
                    filterFn: 'includesString',
                },
                {
                    id: 'status',
                    accessorKey: 'status',
                    size: 100,
                    header: () => <p className="column-title">Status</p>,
                    cell: ({ getValue }) => {
                        const status = getValue<string>();
                        return (
                            <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                                {status}
                            </Badge>
                        );
                    },
                },
                {
                    id: 'subject',
                    accessorKey: 'subject',
                    size: 160,
                    header: () => <p className="column-title">Subject</p>,
                    cell: ({ getValue }) => {
                        const subj = getValue<{ name: string } | null>();
                        return <span className="text-foreground">{subj?.name ?? '-'}</span>;
                    },
                },
                {
                    id: 'teacher',
                    accessorKey: 'teacher',
                    size: 160,
                    header: () => <p className="column-title">Teacher</p>,
                    cell: ({ getValue }) => {
                        const t = getValue<{ name: string } | null>();
                        return <span className="text-foreground">{t?.name ?? '-'}</span>;
                    },
                },
                {
                    id: 'capacity',
                    accessorKey: 'capacity',
                    size: 90,
                    header: () => <p className="column-title">Capacity</p>,
                    cell: ({ getValue }) => (
                        <span className="text-foreground">{getValue<number>() ?? '-'}</span>
                    ),
                },
            ],
            []
        ),
        refineCoreProps: {
            resource: 'classes',
            pagination: {
                pageSize: 10,
                mode: 'server',
            },
            filters: {
                permanent: [...searchFilters, ...subjectFilters, ...teacherFilters],
            },
            sorters: {
                initial: [{ field: 'id', order: 'desc' }],
            },
        },
    });

    return (
        <ListView>
            <Breadcrumb />

            <h1 className="page-title">Classes</h1>

            <div className="intro-row">
                <p>Quick access to essential metrics and management tools.</p>

                <div className="action-row">
                    {/* Search */}
                    <div className="search-field">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 w-full border border-e-black rounded-md p-1"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        {/* Subject filter */}
                        <Select
                            value={selectedSubject}
                            onValueChange={(v) => setSelectedSubject(v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by subject" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Subjects</SelectItem>
                                {subjects.map((s: Subject) => (
                                    <SelectItem key={s.id} value={s.name}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Teacher filter */}
                        <Select
                            value={selectedTeacher}
                            onValueChange={(v) => setSelectedTeacher(v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by teacher" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Teachers</SelectItem>
                                {teachers.map((t: User) => (
                                    <SelectItem key={t.id} value={t.name}>
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <CreateButton resource="classes" />
                    </div>
                </div>
            </div>

            <DataTable table={classTable} />
        </ListView>
    );
};

export default ClassList;