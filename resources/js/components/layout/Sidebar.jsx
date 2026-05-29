import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
    LayoutDashboard, Receipt, BookOpen, CreditCard, DollarSign, PieChart,
    Users, Building2, Briefcase, FileText, BarChart3, Settings, Bell,
    ChevronDown, ChevronRight, LogOut, Moon, Sun, Search, Zap,
    Package, ShoppingCart, Truck, Calculator, Wallet, ArrowLeftRight,
    TrendingUp, Shield, Database, Wrench, ChevronLeft, Bot,
    CalendarCheck, CalendarDays, UmbrellaOff, ClipboardList,
} from 'lucide-react';

const navItems = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
        exact: true,
    },
    {
        label: 'Accounting',
        icon: BookOpen,
        badge: null,
        children: [
            { label: 'Chart of Accounts', href: '/accounting/accounts', icon: Database },
            { label: 'Journal Entries', href: '/accounting/journal', icon: FileText },
            { label: 'General Ledger', href: '/accounting/ledger', icon: BookOpen },
            { label: 'Trial Balance', href: '/accounting/trial-balance', icon: BarChart3 },
            { label: 'Reconciliation', href: '/accounting/reconciliation', icon: ArrowLeftRight },
        ],
    },
    {
        label: 'Invoicing',
        icon: Receipt,
        children: [
            { label: 'Sales Invoices', href: '/invoices/sales', icon: Receipt },
            { label: 'Purchase Invoices', href: '/invoices/purchase', icon: ShoppingCart },
            { label: 'Credit Notes', href: '/invoices/credit-notes', icon: FileText },
            { label: 'Proforma', href: '/invoices/proforma', icon: FileText },
            { label: 'Recurring', href: '/invoices/recurring', icon: ArrowLeftRight },
        ],
    },
    {
        label: 'Expenses',
        icon: CreditCard,
        children: [
            { label: 'All Expenses', href: '/expenses', icon: CreditCard },
            { label: 'Employee Claims', href: '/expenses/claims', icon: Users },
            { label: 'Approval Queue', href: '/expenses/approvals', icon: Shield },
            { label: 'Expense Policies', href: '/expenses/policies', icon: FileText },
        ],
    },
    {
        label: 'Banking',
        icon: Wallet,
        children: [
            { label: 'Bank Accounts', href: '/banking/accounts', icon: Building2 },
            { label: 'Transactions', href: '/banking/transactions', icon: ArrowLeftRight },
            { label: 'Reconciliation', href: '/banking/reconciliation', icon: BarChart3 },
            { label: 'Fund Transfers', href: '/banking/transfers', icon: ArrowLeftRight },
        ],
    },
    {
        label: 'Payroll & HR',
        icon: DollarSign,
        children: [
            { label: 'HR Dashboard', href: '/payroll', icon: LayoutDashboard },
            { label: 'Employees', href: '/payroll/employees', icon: Users },
            { label: 'Departments', href: '/payroll/departments', icon: Building2 },
            { label: 'Salary Structures', href: '/payroll/structures', icon: Settings },
            { label: 'Process Payroll', href: '/payroll/process', icon: Zap },
            { label: 'Payslips', href: '/payroll/payslips', icon: FileText },
            { label: 'Attendance', href: '/payroll/attendance', icon: CalendarCheck },
            { label: 'Mark Attendance', href: '/payroll/attendance/mark', icon: ClipboardList },
            { label: 'Leave Requests', href: '/payroll/leave', icon: UmbrellaOff },
            { label: 'Apply Leave', href: '/payroll/leave/apply', icon: CalendarDays },
            { label: 'Leave Types', href: '/payroll/leave/types', icon: FileText },
            { label: 'Leave Allocations', href: '/payroll/leave/allocations', icon: Database },
            { label: 'Leave Balance', href: '/payroll/leave/balance', icon: CalendarDays },
            { label: 'Attendance Report', href: '/payroll/attendance/report', icon: BarChart3 },
            { label: 'Reports', href: '/payroll/reports', icon: BarChart3 },
        ],
    },
    {
        label: 'Tax',
        icon: Calculator,
        children: [
            { label: 'GST', href: '/tax/gst', icon: Calculator },
            { label: 'TDS', href: '/tax/tds', icon: Calculator },
            { label: 'Tax Reports', href: '/tax/reports', icon: BarChart3 },
            { label: 'Tax Settings', href: '/tax/settings', icon: Settings },
        ],
    },
    {
        label: 'Assets',
        icon: Package,
        children: [
            { label: 'Asset Register', href: '/assets', icon: Package },
            { label: 'Depreciation', href: '/assets/depreciation', icon: TrendingUp },
            { label: 'Maintenance', href: '/assets/maintenance', icon: Wrench },
        ],
    },
    {
        label: 'Vendors',
        icon: Truck,
        children: [
            { label: 'All Vendors', href: '/vendors', icon: Truck },
            { label: 'Purchase Orders', href: '/vendors/purchase-orders', icon: ShoppingCart },
            { label: 'Payments Due', href: '/vendors/payments', icon: Wallet },
        ],
    },
    {
        label: 'Customers',
        icon: Users,
        children: [
            { label: 'All Customers', href: '/customers', icon: Users },
            { label: 'Outstanding', href: '/customers/outstanding', icon: CreditCard },
        ],
    },
    {
        label: 'Budget',
        icon: PieChart,
        children: [
            { label: 'Budgets', href: '/budget', icon: PieChart },
            { label: 'Forecasting', href: '/budget/forecast', icon: TrendingUp },
            { label: 'Variance Analysis', href: '/budget/variance', icon: BarChart3 },
        ],
    },
    {
        label: 'Reports',
        icon: BarChart3,
        children: [
            { label: 'P&L Statement', href: '/reports/pnl', icon: BarChart3 },
            { label: 'Balance Sheet', href: '/reports/balance-sheet', icon: FileText },
            { label: 'Cash Flow', href: '/reports/cash-flow', icon: ArrowLeftRight },
            { label: 'Financial Reports', href: '/reports/financial', icon: BarChart3 },
        ],
    },
    {
        label: 'AI Assistant',
        icon: Bot,
        href: '/ai',
        badge: 'NEW',
    },
    {
        label: 'Approvals',
        icon: Shield,
        href: '/approvals',
    },
    {
        label: 'Companies',
        icon: Building2,
        href: '/companies',
        adminOnly: true,
    },
    {
        label: 'Settings',
        icon: Settings,
        children: [
            { label: 'General', href: '/settings', icon: Settings },
            { label: 'Users & Roles', href: '/settings/users', icon: Users },
            { label: 'Permissions', href: '/settings/permissions', icon: Shield },
            { label: 'Notifications', href: '/settings/notifications', icon: Bell },
            { label: 'Integrations', href: '/settings/integrations', icon: Zap },
            { label: 'Audit Logs', href: '/settings/audit', icon: FileText },
            { label: 'Backup', href: '/settings/backup', icon: Database },
        ],
    },
];

function NavItem({ item, collapsed, depth = 0 }) {
    const { url } = usePage();
    const [open, setOpen] = useState(() => {
        if (item.children) {
            return item.children.some((c) => url.startsWith(c.href));
        }
        return false;
    });

    const isActive = item.href
        ? (item.exact ? url === item.href : url.startsWith(item.href))
        : item.children?.some((c) => url.startsWith(c.href));

    if (item.children) {
        return (
            <div>
                <button
                    onClick={() => setOpen((o) => !o)}
                    className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer',
                        isActive
                            ? 'bg-[hsl(var(--sidebar-active-bg))] text-[hsl(var(--sidebar-active-text))]'
                            : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                        collapsed && 'justify-center px-2',
                    )}
                >
                    <item.icon className={cn('h-4 w-4 shrink-0', isActive && 'text-primary')} />
                    {!collapsed && (
                        <>
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge && (
                                <Badge variant="success" className="text-[10px] px-1.5 py-0">{item.badge}</Badge>
                            )}
                            {open ? (
                                <ChevronDown className="h-3.5 w-3.5 opacity-40" />
                            ) : (
                                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                            )}
                        </>
                    )}
                </button>
                {!collapsed && open && (
                    <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-sidebar-border/50 pl-3">
                        {item.children.map((child) => (
                            <NavItem key={child.href} item={child} collapsed={false} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    const link = (
        <Link
            href={item.href}
            className={cn(
                'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
                isActive
                    ? 'bg-[hsl(var(--sidebar-active-bg))] text-[hsl(var(--sidebar-active-text))] font-medium before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:rounded-r before:bg-primary'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                collapsed && 'justify-center px-2',
                depth > 0 && 'text-xs py-1.5 pl-2',
            )}
        >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && (
                <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                        <Badge variant="success" className="text-[10px] px-1.5 py-0">{item.badge}</Badge>
                    )}
                </>
            )}
        </Link>
    );

    if (collapsed) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
        );
    }

    return link;
}

export default function Sidebar({ collapsed, onToggle }) {
    const { auth } = usePage().props;

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
                    collapsed ? 'w-[60px]' : 'w-64',
                )}
            >
                {/* Logo */}
                <div className={cn(
                    'flex h-16 items-center border-b border-sidebar-border px-4',
                    collapsed ? 'justify-center' : 'gap-3',
                )}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-600 text-white font-bold text-sm">
                        FMS
                    </div>
                    {!collapsed && (
                        <div>
                            <p className="text-sm font-bold text-sidebar-foreground">AI-FMS</p>
                            <p className="text-[10px] text-sidebar-foreground/50">Enterprise Finance</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 no-scrollbar">
                    {navItems.map((item) => (
                        <NavItem key={item.label} item={item} collapsed={collapsed} />
                    ))}
                </nav>

                {/* User info */}
                {auth?.user && (
                    <div className={cn(
                        'border-t border-sidebar-border p-3',
                        collapsed ? 'flex justify-center' : 'flex items-center gap-3',
                    )}>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                            {auth.user.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-sidebar-foreground truncate">{auth.user.name}</p>
                                <p className="text-[10px] text-sidebar-foreground/50 truncate">{auth.user.email}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Collapse toggle */}
                <button
                    onClick={onToggle}
                    className="absolute -right-4 top-20 flex h-8 w-8 items-center justify-center rounded-full border border-sidebar-border bg-sidebar shadow-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                >
                    {collapsed ? (
                        <ChevronRight className="h-3 w-3" />
                    ) : (
                        <ChevronLeft className="h-3 w-3" />
                    )}
                </button>
            </aside>
        </TooltipProvider>
    );
}
