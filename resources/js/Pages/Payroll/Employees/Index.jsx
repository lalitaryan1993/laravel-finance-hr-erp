import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
    AlertCircle, Briefcase, FileWarning, Plus, Search, ShieldCheck,
    UserCheck, Users,
} from 'lucide-react'
import { getInitials, formatCurrency, formatDate } from '@/lib/utils'

function StatCard({ icon: Icon, label, value, tone = 'text-primary' }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${tone}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-2xl font-bold tabular-nums">{value ?? 0}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function CompletenessBadge({ completeness }) {
    const pct = completeness?.percent ?? 0
    const complete = completeness?.is_complete

    return (
        <div className="min-w-[120px]">
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Profile</span>
                <span className={`text-xs font-semibold ${complete ? 'text-emerald-600' : 'text-amber-600'}`}>{pct}%</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={`h-full ${complete ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    )
}

export default function EmployeesIndex({ employees = {}, departments = [], filters = {}, stats = {} }) {
    const [search, setSearch] = useState(filters.search ?? '')
    const list = employees.data ?? []

    const applyFilters = (next = {}) => {
        router.get('/payroll/employees', { ...filters, search, ...next }, { preserveState: true, preserveScroll: true })
    }

    return (
        <AppLayout>
            <Head title="Employees" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Employees</h1>
                        <p className="text-muted-foreground text-sm mt-1">{employees.total ?? 0} employees</p>
                    </div>
                    <Button onClick={() => router.visit('/payroll/employees/create')}>
                        <Plus className="w-4 h-4 mr-2" /> Add Employee
                    </Button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard icon={UserCheck} label="Active" value={stats.active} tone="text-emerald-600" />
                    <StatCard icon={Briefcase} label="Onboarding" value={stats.onboarding} tone="text-blue-600" />
                    <StatCard icon={ShieldCheck} label="Probation" value={stats.probation} tone="text-violet-600" />
                    <StatCard icon={AlertCircle} label="Incomplete" value={stats.incomplete_profiles} tone="text-amber-600" />
                    <StatCard icon={FileWarning} label="Docs Expiring" value={stats.documents_expiring} tone="text-red-600" />
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-wrap gap-3">
                            <div className="relative flex-1 min-w-[220px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search employees..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                    className="pl-9"
                                />
                            </div>
                            <select onChange={(e) => applyFilters({ department_id: e.target.value })} defaultValue={filters.department_id ?? ''} className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[160px]">
                                <option value="">All Departments</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            <select onChange={(e) => applyFilters({ status: e.target.value })} defaultValue={filters.status ?? ''} className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[140px]">
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="terminated">Terminated</option>
                            </select>
                            <select onChange={(e) => applyFilters({ employment_type: e.target.value })} defaultValue={filters.employment_type ?? ''} className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[160px]">
                                <option value="">All Types</option>
                                <option value="full_time">Full Time</option>
                                <option value="part_time">Part Time</option>
                                <option value="contract">Contract</option>
                                <option value="intern">Intern</option>
                            </select>
                            <select onChange={(e) => applyFilters({ completeness: e.target.value })} defaultValue={filters.completeness ?? ''} className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[170px]">
                                <option value="">All Profiles</option>
                                <option value="complete">Complete</option>
                                <option value="incomplete">Needs HR Data</option>
                            </select>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Designation</TableHead>
                                    <TableHead>Manager</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Joining Date</TableHead>
                                    <TableHead className="text-right">Basic Salary</TableHead>
                                    <TableHead>Completeness</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                                            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            No employees found
                                        </TableCell>
                                    </TableRow>
                                ) : list.map((emp) => (
                                    <TableRow key={emp.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.visit(`/payroll/employees/${emp.id}`)}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8">
                                                    {emp.photo && <AvatarImage src={`/storage/${emp.photo}`} alt={emp.full_name} />}
                                                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                        {getInitials(emp.full_name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{emp.full_name}</div>
                                                    <div className="text-xs text-muted-foreground">{emp.email ?? emp.phone}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{emp.employee_code}</TableCell>
                                        <TableCell>{emp.department?.name ?? '-'}</TableCell>
                                        <TableCell>{emp.designation ?? '-'}</TableCell>
                                        <TableCell>{emp.reporting_manager?.full_name ?? emp.reporting_manager?.first_name ?? '-'}</TableCell>
                                        <TableCell className="capitalize">{emp.employment_type?.replace('_', ' ') ?? '-'}</TableCell>
                                        <TableCell>{formatDate(emp.date_of_joining)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(emp.basic_salary)}</TableCell>
                                        <TableCell><CompletenessBadge completeness={emp.profile_completeness} /></TableCell>
                                        <TableCell>
                                            <Badge variant={emp.status === 'active' ? 'success' : 'secondary'}>
                                                {emp.status ?? 'active'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

        </AppLayout>
    )
}

