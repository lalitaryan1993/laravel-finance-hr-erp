import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
    TrendingUp, TrendingDown, DollarSign, Receipt, CreditCard, Users,
    ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle2, Clock,
    Building2, BarChart3, Zap, Bot,
} from 'lucide-react';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// KPI Card Component
function KpiCard({ title, value, change, changeLabel, icon: Icon, variant = 'default', prefix = '₹', isCurrency = true }) {
    const isPositive = change >= 0;
    const variantStyles = {
        default: 'from-slate-50 to-white dark:from-slate-900 dark:to-slate-800',
        success: 'from-green-50 to-white dark:from-green-950 dark:to-slate-800',
        danger: 'from-red-50 to-white dark:from-red-950 dark:to-slate-800',
        warning: 'from-amber-50 to-white dark:from-amber-950 dark:to-slate-800',
        info: 'from-blue-50 to-white dark:from-blue-950 dark:to-slate-800',
    };

    return (
        <Card className={`bg-gradient-to-br ${variantStyles[variant]} overflow-hidden`}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="mt-1 text-2xl font-bold text-foreground">
                            {isCurrency ? formatCurrency(value) : `${prefix}${value}`}
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                            {isPositive ? (
                                <ArrowUpRight className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                                <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                            )}
                            <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                                {Math.abs(change)}%
                            </span>
                            <span className="text-xs text-muted-foreground">{changeLabel}</span>
                        </div>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        variant === 'success' ? 'bg-green-100 dark:bg-green-900/50' :
                        variant === 'danger' ? 'bg-red-100 dark:bg-red-900/50' :
                        variant === 'warning' ? 'bg-amber-100 dark:bg-amber-900/50' :
                        variant === 'info' ? 'bg-blue-100 dark:bg-blue-900/50' :
                        'bg-slate-100 dark:bg-slate-800'
                    }`}>
                        <Icon className={`h-6 w-6 ${
                            variant === 'success' ? 'text-green-600' :
                            variant === 'danger' ? 'text-red-500' :
                            variant === 'warning' ? 'text-amber-600' :
                            variant === 'info' ? 'text-blue-600' :
                            'text-slate-600 dark:text-slate-300'
                        }`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Revenue vs Expense Chart
const revenueData = [
    { month: 'Apr', revenue: 4200000, expense: 2800000 },
    { month: 'May', revenue: 5100000, expense: 3200000 },
    { month: 'Jun', revenue: 4800000, expense: 3100000 },
    { month: 'Jul', revenue: 6200000, expense: 3800000 },
    { month: 'Aug', revenue: 5900000, expense: 3600000 },
    { month: 'Sep', revenue: 7100000, expense: 4200000 },
    { month: 'Oct', revenue: 6800000, expense: 4100000 },
    { month: 'Nov', revenue: 7500000, expense: 4500000 },
    { month: 'Dec', revenue: 8200000, expense: 5100000 },
    { month: 'Jan', revenue: 7900000, expense: 4900000 },
    { month: 'Feb', revenue: 8600000, expense: 5300000 },
    { month: 'Mar', revenue: 9200000, expense: 5600000 },
];

const cashFlowData = [
    { month: 'Oct', inflow: 8200000, outflow: -5100000 },
    { month: 'Nov', inflow: 7500000, outflow: -4500000 },
    { month: 'Dec', inflow: 9100000, outflow: -6200000 },
    { month: 'Jan', inflow: 7900000, outflow: -4900000 },
    { month: 'Feb', inflow: 8600000, outflow: -5300000 },
    { month: 'Mar', inflow: 9200000, outflow: -5600000 },
];

const expenseBreakdown = [
    { name: 'Salaries', value: 45 },
    { name: 'Operations', value: 20 },
    { name: 'Marketing', value: 12 },
    { name: 'Technology', value: 10 },
    { name: 'Others', value: 13 },
];

const recentTransactions = [
    { id: 1, description: 'Invoice #INV-2024-0892 — Tata Consultancy', amount: 850000, type: 'income', date: '2024-03-15', status: 'paid' },
    { id: 2, description: 'Office Rent — March 2024', amount: -120000, type: 'expense', date: '2024-03-14', status: 'paid' },
    { id: 3, description: 'Invoice #INV-2024-0891 — Infosys Ltd', amount: 1200000, type: 'income', date: '2024-03-13', status: 'pending' },
    { id: 4, description: 'AWS Cloud Services', amount: -45000, type: 'expense', date: '2024-03-12', status: 'paid' },
    { id: 5, description: 'Payroll — February 2024', amount: -2850000, type: 'expense', date: '2024-03-10', status: 'paid' },
    { id: 6, description: 'Invoice #INV-2024-0890 — Wipro Ltd', amount: 680000, type: 'income', date: '2024-03-09', status: 'overdue' },
];

const pendingApprovals = [
    { id: 1, type: 'Expense', description: 'Travel reimbursement — Rahul Sharma', amount: 18500, requestedBy: 'Rahul Sharma', date: '2024-03-14' },
    { id: 2, type: 'Invoice', description: 'Invoice approval for Reliance Industries', amount: 2500000, requestedBy: 'Priya Nair', date: '2024-03-13' },
    { id: 3, type: 'Purchase', description: 'Server hardware procurement', amount: 450000, requestedBy: 'IT Department', date: '2024-03-12' },
    { id: 4, type: 'Payroll', description: 'Bonus payout — Q4 FY2024', amount: 1200000, requestedBy: 'HR Manager', date: '2024-03-11' },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-background p-3 shadow-lg">
                <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
                {payload.map((entry, i) => (
                    <p key={i} className="text-xs" style={{ color: entry.color }}>
                        {entry.name}: {formatCurrency(Math.abs(entry.value))}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function Dashboard({ stats = {} }) {
    return (
        <AppLayout title="Dashboard">
            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="Total Revenue"
                    value={9200000}
                    change={12.5}
                    changeLabel="vs last month"
                    icon={TrendingUp}
                    variant="success"
                />
                <KpiCard
                    title="Total Expenses"
                    value={5600000}
                    change={-8.2}
                    changeLabel="vs last month"
                    icon={CreditCard}
                    variant="warning"
                />
                <KpiCard
                    title="Net Profit"
                    value={3600000}
                    change={18.4}
                    changeLabel="vs last month"
                    icon={DollarSign}
                    variant="info"
                />
                <KpiCard
                    title="Outstanding Invoices"
                    value={4850000}
                    change={-5.1}
                    changeLabel="vs last month"
                    icon={Receipt}
                    variant="danger"
                />
            </div>

            {/* Secondary KPIs */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-muted-foreground">Cash Balance</p>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xl font-bold">₹1.24 Cr</p>
                        <Progress value={62} className="mt-2 h-1.5" />
                        <p className="text-[10px] text-muted-foreground mt-1">62% of target</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-muted-foreground">Pending Approvals</p>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </div>
                        <p className="text-xl font-bold">14</p>
                        <p className="text-xs text-amber-600 mt-1">4 urgent</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-muted-foreground">Overdue Invoices</p>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        </div>
                        <p className="text-xl font-bold text-red-500">6</p>
                        <p className="text-xs text-muted-foreground mt-1">₹18.2L overdue</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-muted-foreground">Active Employees</p>
                            <Users className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-xl font-bold">248</p>
                        <p className="text-xs text-green-600 mt-1">+3 this month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Charts Row */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                {/* Revenue vs Expense Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Revenue vs Expenses</CardTitle>
                                <CardDescription>FY 2023-24 monthly comparison</CardDescription>
                            </div>
                            <Badge variant="success" className="text-xs">+12.5% YoY</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} className="text-muted-foreground" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#22c55e" strokeWidth={2} fill="url(#revenue)" dot={false} />
                                <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} fill="url(#expense)" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Expense Breakdown */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Expense Breakdown</CardTitle>
                        <CardDescription>Current month distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie
                                    data={expenseBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={75}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {expenseBreakdown.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-2 space-y-1.5">
                            {expenseBreakdown.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                        <span className="text-muted-foreground">{item.name}</span>
                                    </div>
                                    <span className="font-medium">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Cash Flow + Recent Transactions */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                {/* Cash Flow Chart */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Cash Flow</CardTitle>
                        <CardDescription>Last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={cashFlowData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="inflow" name="Inflow" fill="#22c55e" radius={[3, 3, 0, 0]} />
                                <Bar dataKey="outflow" name="Outflow" fill="#ef4444" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Recent Transactions</CardTitle>
                                <CardDescription>Latest financial activities</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">View all</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentTransactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tx.amount > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                            {tx.amount > 0 ? (
                                                <ArrowUpRight className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <ArrowDownRight className="h-4 w-4 text-red-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-tight line-clamp-1 max-w-[250px]">{tx.description}</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className={`text-sm font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {tx.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                                        </span>
                                        <Badge variant={
                                            tx.status === 'paid' ? 'success' :
                                            tx.status === 'pending' ? 'warning' : 'destructive'
                                        } className="text-xs capitalize">{tx.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Approvals + AI Insights */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                {/* Pending Approvals */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Pending Approvals</CardTitle>
                                <CardDescription>Requires your attention</CardDescription>
                            </div>
                            <Badge variant="warning">{pendingApprovals.length} pending</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {pendingApprovals.map((item) => (
                                <div key={item.id} className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
                                    <div className="flex items-start gap-3">
                                        <Badge variant="info" className="mt-0.5 shrink-0">{item.type}</Badge>
                                        <div>
                                            <p className="text-sm font-medium">{item.description}</p>
                                            <p className="text-xs text-muted-foreground">Requested by {item.requestedBy} · {formatDate(item.date)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-4">
                                        <span className="text-sm font-semibold">{formatCurrency(item.amount)}</span>
                                        <Button size="sm" variant="success" className="h-7 text-xs">Approve</Button>
                                        <Button size="sm" variant="outline" className="h-7 text-xs">Review</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* AI Insights */}
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div>
                                <CardTitle className="text-base text-indigo-900 dark:text-indigo-100">AI Insights</CardTitle>
                                <CardDescription className="text-indigo-600/70 dark:text-indigo-400">Smart financial analysis</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            {
                                icon: TrendingUp,
                                color: 'text-green-600',
                                bg: 'bg-green-100 dark:bg-green-900/40',
                                title: 'Revenue on track',
                                desc: 'March revenue is 12% above target. Maintain current momentum for Q4 closing.',
                            },
                            {
                                icon: AlertCircle,
                                color: 'text-amber-600',
                                bg: 'bg-amber-100 dark:bg-amber-900/40',
                                title: 'GST deadline approaching',
                                desc: 'GSTR-1 filing due in 5 days. ₹48.2L pending reconciliation.',
                            },
                            {
                                icon: TrendingDown,
                                color: 'text-blue-600',
                                bg: 'bg-blue-100 dark:bg-blue-900/40',
                                title: 'Optimize vendor payments',
                                desc: '3 vendors offer 2% early-payment discount saving ₹1.2L this month.',
                            },
                        ].map((insight, i) => (
                            <div key={i} className={`rounded-lg p-3 ${insight.bg}`}>
                                <div className="flex items-start gap-2.5">
                                    <insight.icon className={`h-4 w-4 mt-0.5 shrink-0 ${insight.color}`} />
                                    <div>
                                        <p className={`text-xs font-semibold ${insight.color}`}>{insight.title}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{insight.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50">
                            <Bot className="mr-2 h-3.5 w-3.5" />
                            Open AI Assistant
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
