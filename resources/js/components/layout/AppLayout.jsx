import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';

export default function AppLayout({ children, title }) {
    const { flash } = usePage().props;
    const [collapsed, setCollapsed] = useState(() => {
        return localStorage.getItem('sidebar-collapsed') === 'true';
    });

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        }
    }, []);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error)   toast.error(flash.error);
        if (flash?.warning) toast(flash.warning, { icon: '⚠️' });
    }, [flash]);

    const handleToggle = () => {
        setCollapsed((c) => {
            localStorage.setItem('sidebar-collapsed', !c);
            return !c;
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <Sidebar collapsed={collapsed} onToggle={handleToggle} />
            <Navbar sidebarCollapsed={collapsed} />

            <main
                className={cn(
                    'min-h-screen pt-16 transition-all duration-300',
                    collapsed ? 'pl-[60px]' : 'pl-64',
                )}
            >
                <div className="p-6 page-enter">
                    {title && (
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
}
