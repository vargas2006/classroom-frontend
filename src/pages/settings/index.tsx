import React, { useState } from 'react';
import { useGetIdentity, useNotification } from '@refinedev/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User as UserIcon, Lock, Shield, BookOpen, GraduationCap,
    Loader2, Save, KeyRound, Camera, Mail, IdCard,
} from 'lucide-react';
import { BACKEND_BASE_URL } from '@/constants';
import UploadWidget from '@/components/upload-widget';
import { User } from '@/types';

// ── Zod schemas ────────────────────────────────────────────────────────────
const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    image: z.string().optional(),
    imageCldPubId: z.string().optional(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

// ── Role badge helper ──────────────────────────────────────────────────────
const RoleIcon = ({ role }: { role?: string }) => {
    if (role === 'admin') return <Shield className="h-3.5 w-3.5" />;
    if (role === 'teacher') return <BookOpen className="h-3.5 w-3.5" />;
    return <GraduationCap className="h-3.5 w-3.5" />;
};

const roleVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
    admin: 'default',
    teacher: 'secondary',
    student: 'outline',
};

// ── Settings page ──────────────────────────────────────────────────────────
const SettingsPage = () => {
    const { data: identity, refetch } = useGetIdentity<User>();
    const { open } = useNotification();

    const [profileSaving, setProfileSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);

    // Profile form
    const profileForm = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        values: {
            name: identity?.name ?? '',
            image: identity?.image ?? '',
            imageCldPubId: identity?.imageCldPubId ?? '',
        },
    });

    // Password form
    const passwordForm = useForm<PasswordValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    });

    const avatarPublicId = profileForm.watch('imageCldPubId');
    const avatarUrl = profileForm.watch('image');

    const setAvatarImage = (file: any) => {
        if (file) {
            const url = typeof file === 'string' ? file : file.url;
            const publicId = typeof file === 'object' ? file.publicId : '';
            profileForm.setValue('image', url, { shouldDirty: true });
            profileForm.setValue('imageCldPubId', publicId, { shouldDirty: true });
        } else {
            profileForm.setValue('image', '', { shouldDirty: true });
            profileForm.setValue('imageCldPubId', '', { shouldDirty: true });
        }
    };

    // Save profile
    const onSaveProfile = async (values: ProfileValues) => {
        if (!identity?.id) return;
        setProfileSaving(true);
        try {
            const res = await fetch(`${BACKEND_BASE_URL}/users/${identity.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: values.name,
                    image: values.image || null,
                    imageCldPubId: values.imageCldPubId || null,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error ?? 'Failed to update profile.');
            }

            await refetch?.();
            open?.({ type: 'success', message: 'Profile updated successfully.' });
        } catch (e: any) {
            open?.({ type: 'error', message: e.message ?? 'Failed to update profile.' });
        } finally {
            setProfileSaving(false);
        }
    };

    // Change password
    const onChangePassword = async (values: PasswordValues) => {
        if (!identity?.id) return;
        setPasswordSaving(true);
        try {
            const res = await fetch(`${BACKEND_BASE_URL}/users/${identity.id}/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error ?? 'Failed to change password.');
            }

            passwordForm.reset();
            open?.({ type: 'success', message: 'Password changed successfully.' });
        } catch (e: any) {
            open?.({ type: 'error', message: e.message ?? 'Failed to change password.' });
        } finally {
            setPasswordSaving(false);
        }
    };

    const initials = identity?.name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?';

    return (
        <div className="settings-page">
            {/* ── Page header ── */}
            <div className="settings-header">
                <div>
                    <h1 className="settings-title">Settings</h1>
                    <p className="settings-subtitle">Manage your account and preferences.</p>
                </div>
            </div>

            <Separator className="my-6" />

            <div className="settings-layout">
                {/* ── Profile card (left) ── */}
                <aside className="settings-aside">
                    <Card className="settings-profile-card">
                        <CardContent className="pt-6 flex flex-col items-center gap-4">
                            {/* Avatar */}
                            <div className="settings-avatar-wrapper">
                                {avatarUrl || identity?.image ? (
                                    <img
                                        src={avatarUrl || identity?.image}
                                        alt={identity?.name}
                                        className="settings-avatar-img"
                                    />
                                ) : (
                                    <div className="settings-avatar-fallback">
                                        {initials}
                                    </div>
                                )}
                                <div className="settings-avatar-badge">
                                    <Camera className="h-3 w-3" />
                                </div>
                            </div>

                            {/* Name & role */}
                            <div className="text-center space-y-1">
                                <p className="font-semibold text-base">{identity?.name ?? '—'}</p>
                                <p className="text-xs text-muted-foreground">{identity?.email}</p>
                                <Badge variant={roleVariant[identity?.role ?? 'student'] ?? 'outline'} className="gap-1 capitalize mt-1">
                                    <RoleIcon role={identity?.role} />
                                    {identity?.role ?? 'student'}
                                </Badge>
                            </div>

                            <Separator className="w-full" />

                            {/* Read-only info */}
                            <div className="settings-info-list">
                                <div className="settings-info-row">
                                    <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                    <span className="text-xs text-muted-foreground truncate">{identity?.email}</span>
                                </div>
                                <div className="settings-info-row">
                                    <IdCard className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                    <span className="text-xs font-mono text-muted-foreground truncate">{identity?.id?.slice(0, 16)}…</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </aside>

                {/* ── Tabs (right) ── */}
                <div className="settings-content">
                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="mb-6 w-full sm:w-auto">
                            <TabsTrigger value="profile" className="gap-2">
                                <UserIcon className="h-4 w-4" />
                                Profile
                            </TabsTrigger>
                            <TabsTrigger value="password" className="gap-2">
                                <Lock className="h-4 w-4" />
                                Password
                            </TabsTrigger>
                        </TabsList>

                        {/* ── Profile Tab ── */}
                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>
                                        Update your display name and profile photo.
                                        Your email and role can only be changed by an admin.
                                    </CardDescription>
                                </CardHeader>
                                <Separator />
                                <CardContent className="pt-6">
                                    <Form {...profileForm}>
                                        <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-6">
                                            <input type="hidden" {...profileForm.register('image')} />
                                            <input type="hidden" {...profileForm.register('imageCldPubId')} />

                                            {/* Photo upload */}
                                            <FormField
                                                control={profileForm.control}
                                                name="image"
                                                render={() => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-1.5">
                                                            <Camera className="h-3.5 w-3.5" />
                                                            Profile Photo
                                                        </FormLabel>
                                                        <FormControl>
                                                            <UploadWidget
                                                                value={avatarUrl ? { url: avatarUrl, publicId: avatarPublicId ?? '' } : null}
                                                                onChange={setAvatarImage}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            PNG, JPG or WebP up to 5 MB.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Full name */}
                                            <FormField
                                                control={profileForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Full Name <span className="text-destructive">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Jane Doe" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Email (read-only) */}
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1.5">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    Email Address
                                                </FormLabel>
                                                <Input
                                                    value={identity?.email ?? ''}
                                                    disabled
                                                    className="bg-muted cursor-not-allowed"
                                                />
                                                <FormDescription>
                                                    Email address cannot be changed. Contact an admin if needed.
                                                </FormDescription>
                                            </FormItem>

                                            {/* Role (read-only) */}
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1.5">
                                                    <Shield className="h-3.5 w-3.5" />
                                                    Role
                                                </FormLabel>
                                                <Input
                                                    value={identity?.role ?? ''}
                                                    disabled
                                                    className="bg-muted cursor-not-allowed capitalize"
                                                />
                                                <FormDescription>
                                                    Your role is assigned by an admin.
                                                </FormDescription>
                                            </FormItem>

                                            <Separator />

                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="w-full sm:w-auto"
                                                disabled={profileSaving || !profileForm.formState.isDirty}
                                            >
                                                {profileSaving ? (
                                                    <span className="flex items-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Saving…
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        <Save className="h-4 w-4" />
                                                        Save Changes
                                                    </span>
                                                )}
                                            </Button>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── Password Tab ── */}
                        <TabsContent value="password">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Change Password</CardTitle>
                                    <CardDescription>
                                        Choose a strong password with at least 6 characters.
                                        You'll need your current password to confirm.
                                    </CardDescription>
                                </CardHeader>
                                <Separator />
                                <CardContent className="pt-6">
                                    <Form {...passwordForm}>
                                        <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-5 max-w-md">
                                            <FormField
                                                control={passwordForm.control}
                                                name="currentPassword"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Current Password <span className="text-destructive">*</span></FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={passwordForm.control}
                                                name="newPassword"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>New Password <span className="text-destructive">*</span></FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
                                                        </FormControl>
                                                        <FormDescription>Minimum 6 characters.</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={passwordForm.control}
                                                name="confirmPassword"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Confirm New Password <span className="text-destructive">*</span></FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <Separator />

                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="w-full sm:w-auto"
                                                disabled={passwordSaving}
                                            >
                                                {passwordSaving ? (
                                                    <span className="flex items-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Updating…
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        <KeyRound className="h-4 w-4" />
                                                        Update Password
                                                    </span>
                                                )}
                                            </Button>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
