import React from 'react';
import { useShow } from '@refinedev/core';
import { ShowView, ShowViewHeader } from '@/components/refine-ui/views/show-view';
import { User, UserRole } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, BookOpen, GraduationCap, Mail, Calendar, Loader2 } from 'lucide-react';

const roleVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
    admin: 'default',
    teacher: 'secondary',
    student: 'outline',
};

const RoleIcon = ({ role }: { role: string }) => {
    if (role === 'admin') return <Shield className="h-4 w-4" />;
    if (role === 'teacher') return <BookOpen className="h-4 w-4" />;
    return <GraduationCap className="h-4 w-4" />;
};

const UserShow = () => {
    const { query } = useShow<User>({ resource: 'users' });
    const userData = query.data?.data;
    const { isLoading, isError } = query;

    if (isLoading) {
        return (
            <ShowView className="class-view">
                <ShowViewHeader resource="users" title="User Details" />
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin h-10 w-10 text-muted-foreground" />
                </div>
            </ShowView>
        );
    }

    if (isError || !userData) {
        return (
            <ShowView className="class-view">
                <ShowViewHeader resource="users" title="User Details" />
                <p className="text-destructive mt-6 text-sm">
                    {isError ? 'Failed to load user details.' : 'User not found.'}
                </p>
            </ShowView>
        );
    }

    const initials = userData.name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?';

    return (
        <ShowView className="class-view">
            <ShowViewHeader resource="users" title="User Details" />

            <Card className="max-w-2xl mx-auto shadow-md">
                <CardHeader className="pb-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        {userData.image ? (
                            <img
                                src={userData.image}
                                alt={userData.name}
                                className="h-20 w-20 rounded-full object-cover border-2 border-border shadow"
                            />
                        ) : (
                            <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow">
                                {initials}
                            </div>
                        )}
                        <div className="flex-1">
                            <CardTitle className="text-2xl">{userData.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                                <Mail className="h-3.5 w-3.5" />
                                {userData.email}
                            </div>
                            <div className="mt-2">
                                <Badge variant={roleVariant[userData.role] ?? 'outline'} className="gap-1 capitalize">
                                    <RoleIcon role={userData.role} />
                                    {userData.role}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <Separator className="my-4" />

                <CardContent className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">User ID</p>
                            <p className="font-mono text-xs text-muted-foreground truncate">{userData.id}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Joined</p>
                            <div className="flex items-center gap-1 text-foreground">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                {new Date(userData.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'long', day: 'numeric',
                                })}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </ShowView>
    );
};

export default UserShow;
