import React from 'react'
import { ListView } from '@/components/refine-ui/views/list-view';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import {Search} from 'lucide-react';
import { useState } from 'react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import { DEPARTMENT_OPTIONS } from "@/constants";
import { CreateButton } from '@/components/refine-ui/buttons/create';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { useTable } from '@refinedev/react-table';
import { Subject } from '@/types';
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {Badge} from '@/components/ui/badge';



const SubjectList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all')

    const departmentFilters = selectedDepartment === 'all' ? [] : [
        {
            field: 'department',
            operator: 'eq' as const,
            value: selectedDepartment,
        }

    ]
    const searchFilters = searchQuery ? [
        {
            field: 'name',
            operator: 'contains' as const,
            value: searchQuery

        }
    ] : [];
    const subjectTable = useTable<Subject>({
        columns: useMemo<ColumnDef<Subject>[]>(()=> [
            {
                id: 'code',
                accessorKey: 'code',
                size: 100,
                header: () =><p className="column-title ml-2">Code</p>,
                cell:({getValue}) => <Badge>{getValue<string>()}</Badge>
            },
            {
                id: 'name',
                accessorKey: 'name',
                size: 200,
                header: () => <p className="column-title">Name</p>,
                cell: ({getValue})=> <span className="text-foreground">{getValue<string>()}</span>,
                filterFn: 'includesString'
            },
            {
                id: 'department',
                accessorKey: 'department',
                size: 150,
                header: () => <p className="column-title">Department</p>,
                cell: ({ getValue }) => {
                    const val = getValue<any>();
                    const deptName = typeof val === 'object' ? val?.name : val;
                    return <Badge variant={"secondary"}>{deptName || '-'}</Badge>;
                },
            },
            {
                id: 'description',
                accessorKey: 'description',
                size: 300,
                header: () => <p className="column-title">Description</p>,
                cell: ({getValue})=> <span className="truncate line-clamp-2">{getValue<string>()}</span>,
            }


        ], []),
        refineCoreProps: {
            resource: 'subjects',
            pagination: {
                pageSize: 10,
                mode: 'server',  
            },
            filters: {
                permanent: [...departmentFilters, ...searchFilters]
            },
            sorters: {
                initial: [
                    {
                        field: 'id',
                        order: 'desc',
                    }
                ]
            },
        }
    });

    
return (
    <ListView>
        <Breadcrumb/>

        <h1 className="page-title">Subjects</h1>

        <div className="intro-row">
            <p>Quick access to essential metrics and management tools.</p>

            <div className="action-row">
                <div className="search-field">
                    <Search className="search-icon"/>
                    <input type="text" 
                    placeholder="Search..."
                    className="pl-10 w-full border border-e-black rounded-md p-1" 
                    value={searchQuery}
                    onChange={(e)=> setSearchQuery(e.target.value)} />
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <Select value={selectedDepartment}
                    onValueChange={(e)=>{setSelectedDepartment(e)}}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by departments"/>
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">

                                All Departments
                            </SelectItem>
                            {DEPARTMENT_OPTIONS.map(d => (
                                <SelectItem
                                value={d.value}
                                key={d.value}
                                >
                                    {d.label}
                                </SelectItem>
                            ))}

                        </SelectContent>
                    
                    </Select>
                    <CreateButton/>
                </div>
            </div>
        </div>
        <DataTable table={subjectTable} />
    </ListView>
  )
}

export default SubjectList;