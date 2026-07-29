import React from 'react';
import { CreateView } from '@/components/refine-ui/views/create-view';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { Button } from '@/components/ui/button';
import { useBack } from '@refinedev/core';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from '@refinedev/react-hook-form';
import { userSchema } from '@/lib/schema';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Shield, BookOpen, GraduationCap } from 'lucide-react';
import UploadWidget from '@/components/upload-widget';

const UserEdit = () => {
    const back = useBack();

    const form = useForm({
        resolver: zodResolver(userSchema) as any,
        refineCoreProps: {
            resource: 'users',
            action: 'edit',
        },
    });

    const { refineCore: { onFinish, query }, handleSubmit, formState: { isSubmitting }, control, setValue, watch } = form;
    const isLoading = query?.isLoading;

    const avatarPublicId = watch('imageCldPubId');

    const setAvatarImage = (file: any, field: any) => {
        if (file) {
            const url = typeof file === 'string' ? file : file.url;
            const publicId = typeof file === 'object' ? file.publicId : '';
            field.onChange(url);
            setValue('image', url, { shouldValidate: true, shouldDirty: true });
            setValue('imageCldPubId', publicId, { shouldValidate: true, shouldDirty: true });
        } else {
            field.onChange('');
            setValue('image', '', { shouldValidate: true, shouldDirty: true });
            setValue('imageCldPubId', '', { shouldValidate: true, shouldDirty: true });
        }
    };

    const onSubmit = async (values: any) => {
        const formValues = form.getValues();
        await onFinish({ ...values, ...formValues });
    };

    return (
        <CreateView className="class-view">
            <Breadcrumb />
            <h1 className="page-title">Edit User</h1>
            <div className="intro-row">
                <p className="text-muted-foreground">Update user information and role assignment.</p>
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
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                            </div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    <input type="hidden" {...form.register('image')} />
                                    <input type="hidden" {...form.register('imageCldPubId')} />

                                    <FormField
                                        control={control}
                                        name="image"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Profile Photo</FormLabel>
                                                <FormControl>
                                                    <UploadWidget
                                                        value={field.value ? { url: field.value, publicId: avatarPublicId ?? '' } : null}
                                                        onChange={(file: any) => setAvatarImage(file, field)}
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
                                                <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Jane Doe" {...field} />
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
                                                            <span className="flex items-center gap-2"><Shield className="h-4 w-4" /> Admin</span>
                                                        </SelectItem>
                                                        <SelectItem value="teacher">
                                                            <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Teacher</span>
                                                        </SelectItem>
                                                        <SelectItem value="student">
                                                            <span className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Student</span>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
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
        </CreateView>
    );
};

export default UserEdit;
