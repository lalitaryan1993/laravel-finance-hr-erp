import * as React from 'react';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, useNavigation } from 'react-day-picker';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef(({ className, align = 'start', sideOffset = 4, ...props }, ref) => (
    <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
            ref={ref}
            align={align}
            sideOffset={sideOffset}
            className={cn(
                'z-50 w-auto rounded-md border bg-popover text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                className,
            )}
            {...props}
        />
    </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function CalendarCaption({ displayMonth }) {
    const { goToMonth, nextMonth, previousMonth } = useNavigation();
    const year  = displayMonth.getFullYear();
    const month = displayMonth.getMonth();
    const thisYear = new Date().getFullYear();

    const years = useMemo(
        () => Array.from({ length: thisYear - 1929 + 3 }, (_, i) => thisYear + 2 - i),
        [thisYear],
    );

    const selCls = [
        'h-7 rounded-md border border-input bg-background',
        'px-1.5 text-sm font-medium cursor-pointer',
        'focus:outline-none focus:ring-1 focus:ring-ring',
        'hover:bg-accent hover:text-accent-foreground transition-colors',
    ].join(' ');

    const navBtn = cn(
        buttonVariants({ variant: 'outline' }),
        'h-7 w-7 p-0 opacity-60 hover:opacity-100 shrink-0',
    );

    return (
        <div className="flex items-center justify-between gap-1 px-1 pt-1">
            <button
                type="button"
                disabled={!previousMonth}
                onClick={() => previousMonth && goToMonth(previousMonth)}
                className={navBtn}
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1">
                <select
                    value={month}
                    onChange={e => goToMonth(new Date(year, +e.target.value, 1))}
                    className={selCls}
                >
                    {MONTHS.map((m, i) => (
                        <option key={i} value={i}>{m}</option>
                    ))}
                </select>
                <select
                    value={year}
                    onChange={e => goToMonth(new Date(+e.target.value, month, 1))}
                    className={selCls}
                >
                    {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>

            <button
                type="button"
                disabled={!nextMonth}
                onClick={() => nextMonth && goToMonth(nextMonth)}
                className={navBtn}
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}

function Calendar({ className, classNames, showOutsideDays = true, fromYear = 1930, toYear, ...props }) {
    const endYear = toYear ?? new Date().getFullYear() + 2;
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            fromYear={fromYear}
            toYear={endYear}
            className={cn('p-3', className)}
            classNames={{
                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month: 'space-y-4',
                caption: 'flex justify-center pt-1 relative items-center',
                caption_label: 'hidden',
                nav: 'hidden',
                nav_button: 'hidden',
                nav_button_previous: 'hidden',
                nav_button_next: 'hidden',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                row: 'flex w-full mt-2',
                cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                day: cn(buttonVariants({ variant: 'ghost' }), 'h-9 w-9 p-0 font-normal aria-selected:opacity-100'),
                day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                day_today: 'bg-accent text-accent-foreground',
                day_outside: 'text-muted-foreground opacity-50',
                day_disabled: 'text-muted-foreground opacity-50',
                day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
                day_hidden: 'invisible',
                ...classNames,
            }}
            components={{
                Caption: CalendarCaption,
            }}
            {...props}
        />
    );
}

function DatePicker({ value, onChange, placeholder = 'Pick a date', className, disabled, fromYear, toYear }) {
    const [open, setOpen] = React.useState(false);

    const selected = React.useMemo(() => {
        if (!value) return undefined;
        const d = new Date(value + 'T00:00:00');
        return isNaN(d.getTime()) ? undefined : d;
    }, [value]);

    const handleSelect = (date) => {
        onChange?.(date ? format(date, 'yyyy-MM-dd') : null);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn('w-full justify-start text-left font-normal', !value && 'text-muted-foreground', className)}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selected ? format(selected, 'dd MMM yyyy') : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selected}
                    onSelect={handleSelect}
                    defaultMonth={selected ?? new Date()}
                    fromYear={fromYear}
                    toYear={toYear}
                />
            </PopoverContent>
        </Popover>
    );
}

export { DatePicker, Calendar, Popover, PopoverTrigger, PopoverContent };
