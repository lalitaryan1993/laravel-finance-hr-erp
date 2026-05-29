import { useState, useMemo } from 'react'
import { Country, State, City } from 'country-state-city'
import { cn } from '@/lib/utils'
import { ChevronDown, MapPin } from 'lucide-react'

function NativeSelect({ value, onChange, options, placeholder, disabled, className }) {
    return (
        <div className="relative">
            <select
                value={value ?? ''}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                className={cn(
                    'w-full h-9 appearance-none rounded-md border border-input bg-background pl-3 pr-8 text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    className,
                )}
            >
                <option value="">{placeholder}</option>
                {options.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        </div>
    )
}

/**
 * Cascading Country → State → City selector.
 *
 * Props:
 *   country      / onCountryChange   — ISO2 code, e.g. "IN"
 *   countryName  / onCountryNameChange
 *   state        / onStateChange     — state isoCode, e.g. "MH"
 *   stateName    / onStateNameChange
 *   city         / onCityChange      — city name string
 *   showCity     — boolean (default true)
 */
export function LocationSelect({
    country = '',
    onCountryChange,
    countryName = '',
    onCountryNameChange,
    state = '',
    onStateChange,
    stateName = '',
    onStateNameChange,
    city = '',
    onCityChange,
    showCity = true,
    className,
}) {
    const countries = useMemo(() =>
        Country.getAllCountries().map(c => ({ value: c.isoCode, label: c.name })),
    [])

    const states = useMemo(() =>
        country ? State.getStatesOfCountry(country).map(s => ({ value: s.isoCode, label: s.name })) : [],
    [country])

    const cities = useMemo(() =>
        (country && state) ? City.getCitiesOfState(country, state).map(c => ({ value: c.name, label: c.name })) : [],
    [country, state])

    function handleCountryChange(code) {
        const found = Country.getCountryByCode(code)
        onCountryChange?.(code)
        onCountryNameChange?.(found?.name ?? '')
        onStateChange?.('')
        onStateNameChange?.('')
        onCityChange?.('')
    }

    function handleStateChange(code) {
        const found = state ? State.getStateByCodeAndCountry(code, country) : null
        onStateChange?.(code)
        onStateNameChange?.(found?.name ?? '')
        onCityChange?.('')
    }

    function handleCityChange(name) {
        onCityChange?.(name)
    }

    return (
        <div className={cn('grid gap-3', showCity ? 'grid-cols-3' : 'grid-cols-2', className)}>
            <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Country
                </label>
                <NativeSelect
                    value={country}
                    onChange={handleCountryChange}
                    options={countries}
                    placeholder="Select country…"
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">State / Province</label>
                <NativeSelect
                    value={state}
                    onChange={handleStateChange}
                    options={states}
                    placeholder={country ? 'Select state…' : 'Select country first'}
                    disabled={!country}
                />
            </div>
            {showCity && (
                <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">City</label>
                    <NativeSelect
                        value={city}
                        onChange={handleCityChange}
                        options={cities}
                        placeholder={state ? 'Select city…' : 'Select state first'}
                        disabled={!state}
                    />
                </div>
            )}
        </div>
    )
}
