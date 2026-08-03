import React, { useMemo } from 'react';
import { EditView } from '@/components/refine-ui/views/edit-view';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { Button } from '@/components/ui/button';
import { useBack, useList } from '@refinedev/core';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from '@refinedev/react-hook-form';
import { classSchema } from '@/lib/schema';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Subject, Department, User } from '@/types';
import UploadWidget from '@/components/upload-widget';

const ClassEdit = () => {
    const back = useBack();

    const form = useForm({
        resolver: zodResolver(classSchema) as any,
        refineCoreProps: {
            resource: 'classes',
            action: 'edit',
        },
    });

    const { refineCore: { onFinish, query }, handleSubmit, formState: { isSubmitting }, control, setValue, watch } = form;
    const isLoading = query?.isLoading;

    const teacherFilters = useMemo(
        () => [{ field: 'role', operator: 'eq' as const, value: 'teacher' }],
        []
    );

    // Fetch subjects for dropdown
    const subjectsQuery = useList<Subject>({
        resource: 'subjects',
        pagination: { pageSize: 200 },
        queryOptions: { retry: 1, refetchOnWindowFocus: false, staleTime: 60000 },
    });
    const subjects = subjectsQuery.query.data?.data ?? [];
    const subjectsLoading = subjectsQuery.query.isLoading;

    // Fetch teachers for dropdown
    const teachersQuery = useList<User>({
        resource: 'users',
        filters: teacherFilters,
        pagination: { pageSize: 200 },
        queryOptions: { retry: 1, refetchOnWindowFocus: false, staleTime: 60000 },
    });
    const teachers = teachersQuery.query.data?.data ?? [];
    const teachersLoading = teachersQuery.query.isLoading;

    // Fetch departments for derived department display
    const deptQuery = useList<Department>({
        resource: 'departments',
        pagination: { pageSize: 200 },
        queryOptions: { retry: 1, refetchOnWindowFocus: false, staleTime: 60000 },
    });
    const departments = deptQuery.query.data?.data ?? [];

    const selectedSubject = watch('subjectId');
    const derivedDept = subjects.find((s: Subject) => s.id === Number(selectedSubject))?.departmentId;
    const deptName = departments.find((d: Department) => d.id === derivedDept)?.name;

    const onSubmit = async (values: any) => {
        await onFinish(values);
    };

    return (
        <EditView className="class-view">
            <Breadcrumb />
            <h1 className="page-title">Edit Class</h1>
            <div className="intro-row">
                <p className="text-muted-foreground">Update class details, schedule, and banner.</p>
                <Button variant="outline" onClick={() => back()}>Go Back</Button>
            </div>
            <Separator className="my-4" />

            <div className="my-4 flex items-center">
                <Card className="class-form-card">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Class Details</CardTitle>
                    </CardHeader>
                    <Separator />
                    <CardContent className="mt-7">
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                            </div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    {/* Hidden fields for image upload */}
                                    <input type="hidden" {...form.register('bannerUrl')} />
                                    <input type="hidden" {...form.register('bannerCldPubId')} />

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Class Name <span className="text-destructive">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Intro to CS" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name="subjectId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Subject <span className="text-destructive">*</span></FormLabel>
                                                    <Select
                                                        onValueChange={(v) => field.onChange(Number(v))}
                                                        value={field.value?.toString() ?? ''}
                                                        disabled={subjectsLoading}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={subjectsLoading ? 'Loading...' : 'Select subject'} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {subjects.map((sub) => (
                                                                <SelectItem key={sub.id} value={sub.id.toString()}>
                                                                    <span className="font-mono text-xs text-muted-foreground mr-2">{sub.code}</span>
                                                                    {sub.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Show derived department name if available */}
                                    {derivedDept && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Department: <span className="font-medium">{deptName || '—'}</span>
                                        </p>
                                    )}

                                    <FormField
                                        control={control}
                                        name="teacherId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Teacher <span className="text-destructive">*</span></FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value ?? ''}
                                                    disabled={teachersLoading}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={teachersLoading ? 'Loading...' : 'Select a teacher'} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {teachers.map((teacher) => (
                                                            <SelectItem key={teacher.id} value={teacher.id}>
                                                                {teacher.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="capacity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Capacity</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min={1} placeholder="50" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status <span className="text-destructive">*</span></FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="inactive">Inactive</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea rows={4} placeholder="Class description..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Banner upload */}
                                    <FormField
                                        control={control}
                                        name="bannerUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Banner Image</FormLabel>
                                                <FormControl>
                                                    <UploadWidget
                                                        value={field.value ? { url: field.value, publicId: watch('bannerCldPubId') } : null}
                                                        onChange={(file: any) => {
                                                            if (file) {
                                                                const url = typeof file === 'string' ? file : file.url;
                                                                const pubId = typeof file === 'object' ? file.publicId : '';
                                                                field.onChange(url);
                                                                setValue('bannerCldPubId', pubId, { shouldValidate: true, shouldDirty: true });
                                                            } else {
                                                                field.onChange('');
                                                                setValue('bannerCldPubId', '', { shouldValidate: true, shouldDirty: true });
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Schedules – simple JSON textarea */}
                                    <FormField
                                        control={control}
                                        name="schedules"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Schedules (JSON)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder='[{"day":"Monday","startTime":"09:00","endTime":"11:00"}]'
                                                        rows={4}
                                                        value={field.value ? JSON.stringify(field.value, null, 2) : ''}
                                                        onChange={(e) => {
                                                            try {
                                                                const parsed = JSON.parse(e.target.value);
                                                                field.onChange(parsed);
                                                            } catch {
                                                                // keep raw string if JSON invalid
                                                                field.onChange(e.target.value);
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Separator />
                                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <div className="flex gap-2 items-center">
                                                <span>Saving...</span>
                                                <Loader2 className="animate-spin h-4 w-4" />
                                            </div>
                                        ) : 'Save Changes'}
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </EditView>
    );
};

export default ClassEdit;
