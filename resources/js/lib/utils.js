import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = 'INR', locale = null) {
    const resolvedLocale = locale ?? (currency === 'INR' ? 'en-IN' : 'en-US')
    return new Intl.NumberFormat(resolvedLocale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(amount ?? 0);
}

export function formatNumber(num, decimals = 2) {
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num ?? 0);
}

export function formatDate(date, format = 'dd/MM/yyyy') {
    if (!date) return '—';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return format
        .replace('dd', day)
        .replace('MM', month)
        .replace('yyyy', year);
}

export function formatRelativeTime(date) {
    const now = new Date();
    const past = new Date(date);
    const diff = Math.floor((now - past) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return formatDate(date);
}

export function truncate(str, length = 50) {
    if (!str) return '';
    return str.length > length ? `${str.slice(0, length)}…` : str;
}

export function getInitials(name = '') {
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join('');
}

export function classifyAmount(amount) {
    if (amount > 0) return 'positive';
    if (amount < 0) return 'negative';
    return 'neutral';
}

export function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
