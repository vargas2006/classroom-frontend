import React, { useMemo } from "react";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { useBack, useList } from "@refinedev/core";
import { Subject, User } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { classSchema } from "@/lib/schema";
import * as z from "zod";
import UploadWidget from "@/components/upload-widget";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload } from "lucide-react";

const Create = () => {
    const back = useBack();

    const form = useForm({
        resolver: zodResolver(classSchema) as any,
        refineCoreProps: {
            resource: "classes",
            action: "create",
        },
        defaultValues: {
            name: "",
            subjectId: undefined as unknown as number,
            teacherId: "",
            capacity: undefined as unknown as number,
            status: "active",
            description: "",
            bannerUrl: "",
            bannerCldPubId: "",
        },
    });

    const {
        refineCore: {onFinish},
        handleSubmit,
        formState: { isSubmitting, errors},
        control,
        
    } = form;

    const onSubmit = async (values: any) => {
        try {
            const formValues = form.getValues();
            const bannerUrl = formValues.bannerUrl || values.bannerUrl || null;
            const bannerCldPubId = formValues.bannerCldPubId || values.bannerCldPubId || null;

            const payload = {
                ...formValues,
                ...values,
                bannerUrl,
                bannerCldPubId,
            };
            await onFinish(payload);
        } catch (error) {
            console.error("Error creating class:", error);
        }
    };

const teacherFilters = useMemo(
    () => [{ field: 'role', operator: 'eq' as const, value: 'teacher' }],
    []
);

const { query: subjectsQuery } = useList<Subject>({
    resource: "subjects",
    pagination: {
        pageSize: 100,
    },
    queryOptions: { retry: 1, refetchOnWindowFocus: false, staleTime: 60000 },
});

const { query: teachersQuery } = useList<User>({
    resource: "users",
    filters: teacherFilters,
    pagination: {
        pageSize: 100,
    },
    queryOptions: { retry: 1, refetchOnWindowFocus: false, staleTime: 60000 },
});

const subjects = subjectsQuery?.data?.data || [];
const subjectsLoading = subjectsQuery.isLoading;

const teachers = teachersQuery?.data?.data || [];
const teachersLoading = teachersQuery.isLoading;


    const bannerPublicId = form.watch("bannerCldPubId");
    const setBannerImage = (file: any, field: any) => {
      if (file) {
        const url = typeof file === 'string' ? file : file.url;
        const publicId = typeof file === 'object' ? file.publicId : '';
        field.onChange(url);
        form.setValue('bannerUrl', url, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
        form.setValue('bannerCldPubId', publicId, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      } else {
        field.onChange('');
        form.setValue('bannerUrl', '', {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
        form.setValue('bannerCldPubId', '', {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    };
    return (
        <CreateView className="class-view">
            <Breadcrumb />

            <h1 className="page-title">Create a Class</h1>
            <div className="intro-row">
                <p>Provide the required information below to add a class.</p>
                <Button onClick={() => back()}>Go Back</Button>
            </div>

            <Separator />

            <div className="my-4 flex items-center">
                <Card className="class-form-card">
                    <CardHeader className="relative z-10">
                        <CardTitle className="text-2xl pb-0 font-bold text-gradient-orange">
                            Fill out form
                        </CardTitle>
                    </CardHeader>

                    <Separator />

                    <CardContent className="mt-7">
                        <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <input type="hidden" {...form.register("bannerUrl")} />
                                <input type="hidden" {...form.register("bannerCldPubId")} />
                                <FormField 
                                control={control}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Banner Image<span className="text-orange-600">*</span></FormLabel>
                                        <FormControl>
                                          <UploadWidget 
                                          value={field.value ? {url:
                                            field.value, publicId:
                                          bannerPublicId ?? ''}: null}
                                          onChange={(file: any) => setBannerImage(file, field)}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                        {errors.bannerCldPubId && !errors
                                        .bannerUrl && (
                                          <p>{errors.bannerCldPubId.message?.toString()}</p>
                                        )
                                        
                                        }
                                    </FormItem>
                                )}
                                name="bannerUrl"
                                />

                                <FormField
                                    control={control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Class Name <span className="text-orange-600">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Introduction to Biology - Section A"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={control}
                                        name="subjectId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Subject <span className="text-orange-600">*</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(value) =>
                                                        field.onChange(Number(value))
                                                    }
                                                    value={field.value?.toString()}
                                                    disabled={subjectsLoading}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select a subject" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {subjects.map((subject) => (
                                                            <SelectItem
                                                                key={subject.id}
                                                                value={subject.id.toString()}
                                                            >
                                                                {subject.name} ({subject.code})
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
                                        name="teacherId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Teacher <span className="text-orange-600">*</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value ?? ""}
                                                    disabled={teachersLoading}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select a teacher" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                         {teachers.map((teacher) => (
                                                             <SelectItem
                                                                 key={teacher.id}
                                                                 value={teacher.id?.toString() ?? ''}
                                                             >
                                                                {teacher.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={control}
                                        name="capacity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Capacity</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="30"
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            field.onChange(value ? Number(value) : undefined);
                                                        }}
                                                        value={field.value ?? ""}
                                                        name={field.name}
                                                        ref={field.ref}
                                                        onBlur={field.onBlur}
                                                    />
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
                                                <FormLabel>
                                                    Status <span className="text-orange-600">*</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
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
                                </div>

                                <FormField
                                    control={control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Brief description about the class"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                <Button type="submit" size="lg" className="w-full">
                                    {isSubmitting ? (
                                        <div className="flex gap-1">
                                            <span>Creating Class...</span>
                                            <Loader2 className="inline-block ml-2 animate-spin" />
                                        </div>
                                    ) : (
                                        "Create Class"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </CreateView>
    );
};

export default Create;