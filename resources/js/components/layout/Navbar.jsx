import React, { useState, useEffect } from 'react';
import { router, usePage, Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Bell, Search, Moon, Sun, Settings, LogOut, User, Building2,
    ChevronDown, HelpCircle, LayoutDashboard, BookOpen, FileText, DollarSign,
    CreditCard, Wallet, Package, Truck, Users, PieChart, BarChart3,
    Bot, Calculator, ArrowLeftRight, TrendingUp, Wrench, ShoppingCart, Shield,
} from 'lucide-react';
import { getInitials } from '@/lib/utils';

function ThemeToggle() {
    const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
    const toggle = () => {
        setDark((d) => {
            document.documentElement.classList.toggle('dark', !d);
            localStorage.setItem('theme', !d ? 'dark' : 'light');
            return !d;
        });
    };
    return (
        <Button variant="ghost" size="icon-sm" onClick={toggle} className="text-muted-foreground hover:text-foreground">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
    );
}

const searchItems = [
    { label: 'Dashboard',          href: '/dashboard',                   group: 'Navigation',  icon: LayoutDashboard },
    { label: 'Chart of Accounts',  href: '/accounting/accounts',         group: 'Accounting',  icon: BookOpen },
    { label: 'Journal Entries',    href: '/accounting/journal',          group: 'Accounting',  icon: FileText },
    { label: 'General Ledger',     href: '/accounting/ledger',           group: 'Accounting',  icon: BookOpen },
    { label: 'Trial Balance',      href: '/accounting/trial-balance',    group: 'Accounting',  icon: BarChart3 },
    { label: 'Reconciliation',     href: '/accounting/reconciliation',   group: 'Accounting',  icon: ArrowLeftRight },
    { label: 'Sales Invoices',     href: '/invoices/sales',              group: 'Invoicing',   icon: FileText },
    { label: 'Purchase Invoices',  href: '/invoices/purchase',           group: 'Invoicing',   icon: ShoppingCart },
    { label: 'Credit Notes',       href: '/invoices/credit-notes',       group: 'Invoicing',   icon: FileText },
    { label: 'All Expenses',       href: '/expenses',                    group: 'Expenses',    icon: CreditCard },
    { label: 'Expense Claims',     href: '/expenses/claims',             group: 'Expenses',    icon: Users },
    { label: 'Approval Queue',     href: '/expenses/approvals',          group: 'Expenses',    icon: FileText },
    { label: 'Bank Accounts',      href: '/banking/accounts',            group: 'Banking',     icon: Wallet },
    { label: 'Transactions',       href: '/banking/transactions',        group: 'Banking',     icon: ArrowLeftRight },
    { label: 'Fund Transfers',     href: '/banking/transfers',           group: 'Banking',     icon: ArrowLeftRight },
    { label: 'Employees',          href: '/payroll/employees',           group: 'Payroll',     icon: Users },
    { label: 'Process Payroll',    href: '/payroll/process',             group: 'Payroll',     icon: DollarSign },
    { label: 'Payslips',           href: '/payroll/payslips',            group: 'Payroll',     icon: FileText },
    { label: 'GST',                href: '/tax/gst',                     group: 'Tax',         icon: Calculator },
    { label: 'TDS',                href: '/tax/tds',                     group: 'Tax',         icon: Calculator },
    { label: 'Asset Register',     href: '/assets',                      group: 'Assets',      icon: Package },
    { label: 'Depreciation',       href: '/assets/depreciation',         group: 'Assets',      icon: TrendingUp },
    { label: 'Maintenance',        href: '/assets/maintenance',          group: 'Assets',      icon: Wrench },
    { label: 'All Vendors',        href: '/vendors',                     group: 'Vendors',     icon: Truck },
    { label: 'Purchase Orders',    href: '/vendors/purchase-orders',     group: 'Vendors',     icon: ShoppingCart },
    { label: 'All Customers',      href: '/customers',                   group: 'Customers',   icon: Users },
    { label: 'Outstanding',        href: '/customers/outstanding',       group: 'Customers',   icon: CreditCard },
    { label: 'Budgets',            href: '/budget',                      group: 'Budget',      icon: PieChart },
    { label: 'Forecasting',        href: '/budget/forecast',             group: 'Budget',      icon: TrendingUp },
    { label: 'Variance Analysis',  href: '/budget/variance',             group: 'Budget',      icon: BarChart3 },
    { label: 'P&L Statement',      href: '/reports/pnl',                 group: 'Reports',     icon: BarChart3 },
    { label: 'Balance Sheet',      href: '/reports/balance-sheet',       group: 'Reports',     icon: FileText },
    { label: 'Cash Flow',          href: '/reports/cash-flow',           group: 'Reports',     icon: ArrowLeftRight },
    { label: 'AI Assistant',       href: '/ai',                          group: 'Tools',       icon: Bot },
    { label: 'Approvals',          href: '/approvals',                   group: 'Tools',       icon: Shield },
    { label: 'Settings',           href: '/settings',                    group: 'Settings',    icon: Settings },
    { label: 'Users & Roles',      href: '/settings/users',              group: 'Settings',    icon: Users },
];

function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setOpen((o) => !o);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const filtered = query.trim()
        ? searchItems.filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            item.group.toLowerCase().includes(query.toLowerCase()))
        : searchItems;

    const groups = [...new Set(filtered.map((i) => i.group))];

    const handleSelect = (href) => {
        setOpen(false);
        setQuery('');
        router.visit(href);
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Search anything…</span>
                <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-input bg-muted px-1.5 font-mono text-[10px]">
                    Ctrl K
                </kbd>
            </button>

            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery(''); }}>
                <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
                    <div className="flex items-center gap-2 border-b px-4 py-3">
                        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                        <input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search pages, modules…"
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') { setOpen(false); setQuery(''); }
                            }}
                        />
                        {query && (
                            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground text-xs">
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto p-2">
                        {filtered.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                No results for "{query}"
                            </div>
                        ) : (
                            groups.map((group) => (
                                <div key={group} className="mb-2">
                                    <p className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                        {group}
                                    </p>
                                    {filtered.filter((i) => i.group === group).map((item) => (
                                        <button
                                            key={item.href}
                                            onClick={() => handleSelect(item.href)}
                                            className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                                        >
                                            <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <span>{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t px-4 py-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span><kbd className="rounded border border-input bg-muted px-1 font-mono">↑↓</kbd> navigate</span>
                        <span><kbd className="rounded border border-input bg-muted px-1 font-mono">↵</kbd> select</span>
                        <span><kbd className="rounded border border-input bg-muted px-1 font-mono">Esc</kbd> close</span>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function Navbar({ sidebarCollapsed }) {
    const { auth, notifications = [], company } = usePage().props;
    const unread = notifications.filter((n) => !n.read_at).length;

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <header
            className={cn(
                'fixed top-0 right-0 z-30 h-16 flex items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-4 sm:px-6 transition-all duration-300',
                sidebarCollapsed ? 'left-[60px]' : 'left-64',
            )}
        >
            {/* Search */}
            <div className="flex-1">
                <GlobalSearch />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1">
                {/* Company switcher */}
                {company && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2 text-sm">
                                <Building2 className="h-4 w-4" />
                                <span className="hidden md:inline max-w-[120px] truncate">{company.name}</span>
                                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Switch Company</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/companies">Manage Companies</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                <ThemeToggle />

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="relative text-muted-foreground hover:text-foreground">
                            <Bell className="h-4 w-4" />
                            {unread > 0 && (
                                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white font-bold">
                                    {unread > 9 ? '9+' : unread}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="flex items-center justify-between">
                            Notifications
                            {unread > 0 && <Badge variant="destructive" className="text-xs">{unread} new</Badge>}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {notifications.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">No notifications</div>
                        ) : (
                            notifications.slice(0, 5).map((n) => (
                                <DropdownMenuItem key={n.id} className={cn('flex-col items-start gap-1', !n.read_at && 'bg-primary/5')}>
                                    <p className="text-sm font-medium">{n.title}</p>
                                    <p className="text-xs text-muted-foreground">{n.message}</p>
                                </DropdownMenuItem>
                            ))
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/notifications" className="text-center text-sm text-primary">View all</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2 pl-2">
                            <Avatar className="h-7 w-7">
                                <AvatarImage src={auth?.user?.avatar} />
                                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                    {getInitials(auth?.user?.name)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="hidden md:inline text-sm font-medium max-w-[100px] truncate">
                                {auth?.user?.name?.split(' ')[0]}
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <p className="font-medium">{auth?.user?.name}</p>
                            <p className="text-xs font-normal text-muted-foreground">{auth?.user?.email}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/profile"><User className="mr-2 h-4 w-4" />Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/help"><HelpCircle className="mr-2 h-4 w-4" />Help & Support</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
