import React, { useState } from 'react';
import { useLogin, useNotification } from '@refinedev/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const { mutate: login, isLoading } = useLogin<LoginValues>() as any;
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = (values: LoginValues) => {
        login(values);
    };

    return (
        <div className="login-page">
            {/* Background decoration */}
            <div className="login-bg-orb login-bg-orb--1" />
            <div className="login-bg-orb login-bg-orb--2" />

            <div className="login-container">
                {/* Logo */}
                <div className="login-brand">
                    <img src="/logo.png" alt="ClassroomMS" className="login-logo" />
                    <h1 className="login-brand-name">Classroom MS</h1>
                </div>

                <Card className="login-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
                        <CardDescription className="text-center">
                            Sign in with your account credentials.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="you@school.edu"
                                                    autoComplete="email"
                                                    autoFocus
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="••••••••"
                                                        autoComplete="current-password"
                                                        className="pr-10"
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        tabIndex={-1}
                                                        onClick={() => setShowPassword(v => !v)}
                                                        className="login-pw-toggle"
                                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                    >
                                                        {showPassword
                                                            ? <EyeOff className="h-4 w-4" />
                                                            : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Signing in…
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <LogIn className="h-4 w-4" />
                                            Sign In
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </Form>

                        <p className="login-footer-note">
                            Don't have an account? Contact your administrator.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
