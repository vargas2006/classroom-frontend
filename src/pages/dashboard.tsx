import React, { useEffect, useState } from 'react';
import { BACKEND_BASE_URL } from '@/constants';
import { DashboardStats } from '@/types';
import {
    Users, GraduationCap, BookOpen, Building2,
    TrendingUp, CheckCircle2, Clock, AlertTriangle,
    Activity, Loader2, RefreshCcw,
} from 'lucide-react';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    AreaChart, Area,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ── Colour palettes ────────────────────────────────────────────────────────
const DEPT_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6'];
const CAP_COLORS = ['#10b981', '#f59e0b', '#ef4444'];
const USER_COLORS = ['#f97316', '#3b82f6', '#10b981'];

// ── Custom Tooltips ────────────────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="bg-popover border border-border rounded-xl p-3 shadow-xl text-sm min-w-[120px]">
                <p className="font-semibold text-foreground mb-1">{label}</p>
                {payload.map((p: any) => (
                    <p key={p.dataKey} className="text-muted-foreground">
                        {p.name}:{' '}
                        <span className="font-bold" style={{ color: p.fill || p.stroke }}>
                            {p.value}
                        </span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const PieTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
        return (
            <div className="bg-popover border border-border rounded-xl p-3 shadow-xl text-sm">
                <p className="font-semibold">{payload[0].name}</p>
                <p className="text-muted-foreground">Count: <span className="font-bold text-foreground">{payload[0].value}</span></p>
            </div>
        );
    }
    return null;
};

// ── Stat Card ──────────────────────────────────────────────────────────────
type StatCardProps = {
    title: string;
    value: number | string;
    subtitle: string;
    icon: React.ReactNode;
    gradient: string;
    badge?: string;
    badgeVariant?: 'default' | 'secondary' | 'outline';
};

const StatCard = ({ title, value, subtitle, icon, gradient, badge, badgeVariant = 'secondary' }: StatCardProps) => (
    <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group">
        <div className={`absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity ${gradient}`} />
        <CardContent className="p-6 relative">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
                    <p className="text-4xl font-extrabold text-foreground tabular-nums">{value}</p>
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                    {badge && <Badge variant={badgeVariant} className="mt-1 text-xs">{badge}</Badge>}
                </div>
                <div className={`p-3.5 rounded-2xl ${gradient} flex-shrink-0`}>
                    {icon}
                </div>
            </div>
        </CardContent>
    </Card>
);

// ── Empty State ────────────────────────────────────────────────────────────
const EmptyChart = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
        <TrendingUp className="h-8 w-8 opacity-30" />
        <p className="text-sm">No {label} data yet</p>
    </div>
);

// ── Dashboard ──────────────────────────────────────────────────────────────
const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    const loadStats = async () => {
        setIsLoading(true);
        setIsError(false);
        try {
            const res = await fetch(`${BACKEND_BASE_URL}/stats`, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            setStats(json.data);
        } catch (err) {
            console.error('Dashboard stats error:', err);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadStats(); }, []);

    // ── Loading ───────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                </div>
                <p className="text-muted-foreground text-sm font-medium">Loading dashboard…</p>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────
    if (isError || !stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <div className="text-center space-y-1">
                    <p className="font-semibold text-foreground">Failed to load dashboard</p>
                    <p className="text-sm text-muted-foreground">Could not fetch stats from the server</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadStats}>
                    <RefreshCcw className="h-4 w-4 mr-2" /> Retry
                </Button>
            </div>
        );
    }

    // ── Derived values ────────────────────────────────────────────────────
    const { userCounts, classCounts, totalEnrollments, totalDepartments, totalSubjects,
        classesByDept, monthlyEnrollments, monthlyEnrollmentTrend, monthlyClassTrend, capacityStatus, recentClasses } = stats;

    const enrollmentTrend = (monthlyEnrollments ?? monthlyEnrollmentTrend ?? []).map(
        (e: { month: string; count: number | string }) => ({ month: e.month, enrollments: Number(e.count) })
    );
    const classTrend = (monthlyClassTrend ?? []).map(
        (c: { month: string; count: number | string }) => ({ month: c.month, classes: Number(c.count) })
    );
    const deptData = (classesByDept ?? []).map(d => ({ name: d.department, value: Number(d.count) }));
    const capData = [
        { name: 'Available', value: capacityStatus.available },
        { name: 'Near Full', value: capacityStatus.nearFull },
        { name: 'Full', value: capacityStatus.full },
    ].filter(d => d.value > 0);
    const userData = [
        { name: 'Admins', value: userCounts.admin },
        { name: 'Teachers', value: userCounts.teacher },
        { name: 'Students', value: userCounts.student },
    ].filter(d => d.value > 0);

    const activeRate = classCounts.total > 0
        ? Math.round((classCounts.active / classCounts.total) * 100)
        : 0;

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div className="space-y-8 p-1">

            {/* ── Page Header ─────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Overview of your classroom management system
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={loadStats}>
                    <RefreshCcw className="h-3.5 w-3.5 mr-2" /> Refresh
                </Button>
            </div>

            {/* ── Stat Cards ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    title="Total Users"
                    value={userCounts.total}
                    subtitle={`${userCounts.teacher} teacher${userCounts.teacher !== 1 ? 's' : ''} · ${userCounts.student} student${userCounts.student !== 1 ? 's' : ''}`}
                    icon={<Users className="h-5 w-5 text-white" />}
                    gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
                    badge={`${userCounts.admin} admin`}
                />
                <StatCard
                    title="Total Classes"
                    value={classCounts.total}
                    subtitle={`${classCounts.active} active · ${classCounts.archived} archived`}
                    icon={<GraduationCap className="h-5 w-5 text-white" />}
                    gradient="bg-gradient-to-br from-amber-500 to-orange-500"
                    badge={`${activeRate}% active`}
                />
                <StatCard
                    title="Enrollments"
                    value={totalEnrollments}
                    subtitle="Total student enrollments across all classes"
                    icon={<Activity className="h-5 w-5 text-white" />}
                    gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
                />
                <StatCard
                    title="Subjects & Depts"
                    value={totalSubjects}
                    subtitle={`Across ${totalDepartments} department${totalDepartments !== 1 ? 's' : ''}`}
                    icon={<BookOpen className="h-5 w-5 text-white" />}
                    gradient="bg-gradient-to-br from-violet-500 to-purple-600"
                    badge={`${totalDepartments} dept`}
                />
            </div>

            {/* ── Charts Row 1 ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Enrollment Trend */}
                <Card className="border border-border/60 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-indigo-500" /> Enrollment Trend
                        </CardTitle>
                        <CardDescription>Monthly enrollment activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-56">
                            {enrollmentTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={enrollmentTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip content={<BarTooltip />} />
                                        <Area type="monotone" dataKey="enrollments" name="Enrollments" stroke="#6366f1" fill="url(#enrollGrad)" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : <EmptyChart label="enrollment" />}
                        </div>
                    </CardContent>
                </Card>

                {/* Class Creation Trend */}
                <Card className="border border-border/60 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-amber-500" /> Class Growth
                        </CardTitle>
                        <CardDescription>New classes created per month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-56">
                            {classTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={classTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip content={<BarTooltip />} />
                                        <Bar dataKey="classes" name="Classes" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={48} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <EmptyChart label="class" />}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Charts Row 2 ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Classes by Department */}
                <Card className="border border-border/60 shadow-sm md:col-span-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-violet-500" /> By Department
                        </CardTitle>
                        <CardDescription>Classes per department</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-52">
                            {deptData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={deptData} cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={4} dataKey="value">
                                            {deptData.map((_, i) => (
                                                <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<PieTooltip />} />
                                        <Legend formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <EmptyChart label="department" />}
                        </div>
                    </CardContent>
                </Card>

                {/* Capacity Status */}
                <Card className="border border-border/60 shadow-sm md:col-span-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Capacity Status
                        </CardTitle>
                        <CardDescription>Current class capacity breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-52">
                            {capData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={capData} cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={4} dataKey="value">
                                            {capData.map((_, i) => (
                                                <Cell key={i} fill={CAP_COLORS[i % CAP_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<PieTooltip />} />
                                        <Legend formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <EmptyChart label="capacity" />}
                        </div>
                    </CardContent>
                </Card>

                {/* User Distribution */}
                <Card className="border border-border/60 shadow-sm md:col-span-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Users className="h-4 w-4 text-orange-500" /> User Roles
                        </CardTitle>
                        <CardDescription>Distribution by role</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-52">
                            {userData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={userData} cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={4} dataKey="value">
                                            {userData.map((_, i) => (
                                                <Cell key={i} fill={USER_COLORS[i % USER_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<PieTooltip />} />
                                        <Legend formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <EmptyChart label="user" />}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Bottom Row — Metrics + Activity ─────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Key Metrics */}
                <Card className="border border-border/60 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Activity className="h-4 w-4 text-indigo-500" /> Key Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { label: 'Active Classes', value: classCounts.active, color: 'bg-emerald-500', pct: activeRate },
                            { label: 'Near-full Classes', value: capacityStatus.nearFull, color: 'bg-amber-500', pct: classCounts.total > 0 ? Math.round((capacityStatus.nearFull / classCounts.total) * 100) : 0 },
                            { label: 'Full Classes', value: capacityStatus.full, color: 'bg-red-500', pct: classCounts.total > 0 ? Math.round((capacityStatus.full / classCounts.total) * 100) : 0 },
                        ].map((m) => (
                            <div key={m.label} className="space-y-1.5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">{m.label}</span>
                                    <span className="font-bold text-foreground">{m.value}</span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${m.color} transition-all duration-700`}
                                        style={{ width: `${Math.min(m.pct, 100)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground text-right">{m.pct}%</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Recent Classes */}
                <Card className="border border-border/60 shadow-sm lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-500" /> Recent Classes
                        </CardTitle>
                        <CardDescription>Latest classes added to the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentClasses.length === 0 ? (
                            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                                No classes created yet
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentClasses.map((cls) => (
                                    <div
                                        key={cls.id}
                                        className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border/40"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                                                <GraduationCap className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm text-foreground truncate">{cls.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {cls.teacherName ?? 'No teacher assigned'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-3">
                                            <Badge
                                                variant={cls.status === 'active' ? 'default' : 'secondary'}
                                                className="text-xs capitalize"
                                            >
                                                {cls.status}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(cls.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;