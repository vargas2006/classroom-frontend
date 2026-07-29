import React, { useMemo } from 'react';
import { CreateView } from '@/components/refine-ui/views/create-view';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { Button } from '@/components/ui/button';
import { useBack, useList } from '@refinedev/core';
import { Department } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from '@refinedev/react-hook-form';
import { subjectSchema } from '@/lib/schema';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const SubjectCreate = () => {
    const back = useBack();

    const form = useForm({
        resolver: zodResolver(subjectSchema) as any,
        refineCoreProps: {
            resource: 'subjects',
            action: 'create',
        },
        defaultValues: {
            name: '',
            code: '',
            description: '',
            departmentId: undefined as unknown as number,
        },
    });

    const { refineCore: { onFinish }, handleSubmit, formState: { isSubmitting }, control } = form;

    const deptQuery = useList<Department>({
        resource: 'departments',
        pagination: { pageSize: 200 },
        queryOptions: { retry: 1, refetchOnWindowFocus: false },
    });
    const departments = deptQuery.query.data?.data ?? [];
    const deptLoading = deptQuery.query.isLoading;

    const onSubmit = async (values: any) => {
        await onFinish({ ...values, code: values.code.toUpperCase() });
    };

    return (
        <CreateView className="class-view">
            <Breadcrumb />
            <h1 className="page-title">Create Subject</h1>
            <div className="intro-row">
                <p className="text-muted-foreground">Add a new academic subject to a department.</p>
                <Button variant="outline" onClick={() => back()}>Go Back</Button>
            </div>
            <Separator className="my-4" />

            <div className="my-4 flex items-center">
                <Card className="class-form-card">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Subject Details</CardTitle>
                    </CardHeader>
                    <Separator />
                    <CardContent className="mt-7">
                        <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subject Name <span className="text-destructive">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Introduction to Computer Science" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name="code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subject Code <span className="text-destructive">*</span></FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="CS101"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={control}
                                    name="departmentId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Department <span className="text-destructive">*</span></FormLabel>
                                            <Select
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                value={field.value?.toString()}
                                                disabled={deptLoading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder={deptLoading ? 'Loading departments...' : 'Select a department'} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {departments.map((dept) => (
                                                        <SelectItem key={dept.id} value={dept.id.toString()}>
                                                            <span className="font-mono text-xs text-muted-foreground mr-2">{dept.code}</span>
                                                            {dept.name}
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
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description <span className="text-destructive">*</span></FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Brief description of what this subject covers..." rows={4} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />
                                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <div className="flex gap-2 items-center">
                                            <span>Creating...</span>
                                            <Loader2 className="animate-spin h-4 w-4" />
                                        </div>
                                    ) : 'Create Subject'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </CreateView>
    );
};

export default SubjectCreate;