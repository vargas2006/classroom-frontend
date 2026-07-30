import React from 'react';
import { CreateView } from '@/components/refine-ui/views/create-view';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { Button } from '@/components/ui/button';
import { useBack, CanAccess } from '@refinedev/core';
import { AccessDenied } from '@/components/refine-ui/layout/access-denied';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from '@refinedev/react-hook-form';
import { z } from 'zod';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Shield, BookOpen, GraduationCap, Eye, EyeOff } from 'lucide-react';

const createUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['admin', 'teacher', 'student'], {
        required_error: 'Please select a role',
    }),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const UserCreate = () => {
    const back = useBack();
    const [showPassword, setShowPassword] = React.useState(false);

    const form = useForm({
        resolver: zodResolver(createUserSchema) as any,
        refineCoreProps: {
            resource: 'users',
            action: 'create',
        },
        defaultValues: {
            name: '',
            email: '',
            role: undefined as any,
            password: '',
        },
    });

    const { refineCore: { onFinish }, handleSubmit, formState: { isSubmitting }, control } = form;

    const onSubmit = async (values: any) => {
        await onFinish(values);
    };

    return (
        <CanAccess resource="users" action="create" fallback={<AccessDenied />}>
            <CreateView className="class-view">
                <Breadcrumb />
                <h1 className="page-title">Create User</h1>
                <div className="intro-row">
                    <p className="text-muted-foreground">Add a new user with name, email, role, and a login password.</p>
                    <Button variant="outline" onClick={() => back()}>Go Back</Button>
                </div>
                <Separator className="my-4" />

            <div className="my-4 flex items-center">
                <Card className="class-form-card">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">User Details</CardTitle>
                    </CardHeader>
                    <Separator />
                    <CardContent className="mt-7">
                        <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                                <FormField
                                    control={control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Jane Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="jane@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Role <span className="text-destructive">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a role" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="admin">
                                                        <span className="flex items-center gap-2">
                                                            <Shield className="h-4 w-4" /> Admin
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="teacher">
                                                        <span className="flex items-center gap-2">
                                                            <BookOpen className="h-4 w-4" /> Teacher
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="student">
                                                        <span className="flex items-center gap-2">
                                                            <GraduationCap className="h-4 w-4" /> Student
                                                        </span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="Min. 6 characters"
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(p => !p)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
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
                                    ) : 'Create User'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </CreateView>
    </CanAccess>
    );
};

export default UserCreate;
