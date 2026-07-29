import React from 'react';
import { CreateView } from '@/components/refine-ui/views/create-view';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { Button } from '@/components/ui/button';
import { useBack } from '@refinedev/core';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from '@refinedev/react-hook-form';
import { departmentSchema } from '@/lib/schema';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const DepartmentCreate = () => {
    const back = useBack();

    const form = useForm({
        resolver: zodResolver(departmentSchema) as any,
        refineCoreProps: {
            resource: 'departments',
            action: 'create',
        },
        defaultValues: { code: '', name: '', description: '' },
    });

    const { refineCore: { onFinish }, handleSubmit, formState: { isSubmitting }, control } = form;

    const onSubmit = async (values: any) => {
        await onFinish({ ...values, code: values.code.toUpperCase() });
    };

    return (
        <CreateView className="class-view">
            <Breadcrumb />
            <h1 className="page-title">Create Department</h1>
            <div className="intro-row">
                <p className="text-muted-foreground">Add a new academic department to organize subjects.</p>
                <Button variant="outline" onClick={() => back()}>Go Back</Button>
            </div>
            <Separator className="my-4" />

            <div className="my-4 flex items-center">
                <Card className="class-form-card">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Department Details</CardTitle>
                    </CardHeader>
                    <Separator />
                    <CardContent className="mt-7">
                        <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={control}
                                        name="code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Code <span className="text-destructive">*</span></FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="CS, MATH, ENG..."
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Department Name <span className="text-destructive">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Computer Science" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Brief description of the department..." {...field} />
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
                                    ) : 'Create Department'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </CreateView>
    );
};

export default DepartmentCreate;
