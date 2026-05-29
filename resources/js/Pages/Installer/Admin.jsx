import { Head, useForm } from '@inertiajs/react';

const TIMEZONES = ['Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London', 'Asia/Dubai', 'Asia/Singapore'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'];

export default function Admin() {
    const { data, setData, post, processing, errors } = useForm({
        company_name:      '',
        name:              '',
        email:             '',
        password:          '',
        password_confirmation: '',
        currency:          'INR',
        timezone:          'Asia/Kolkata',
    });

    function submit(e) {
        e.preventDefault();
        post(route('installer.admin.save'));
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
            <Head title="Admin Setup — AI-FMS" />

            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
                <StepIndicator step={2} />

                <h2 className="text-2xl font-bold text-gray-900 mt-4">Create Admin Account</h2>
                <p className="text-gray-500 text-sm mt-1">Set up your company and administrator details.</p>

                <form onSubmit={submit} className="mt-6 space-y-4">
                    <Field label="Company Name" error={errors.company_name}>
                        <input value={data.company_name} onChange={e => setData('company_name', e.target.value)}
                            placeholder="Acme Corporation" className={input} />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Currency" error={errors.currency}>
                            <select value={data.currency} onChange={e => setData('currency', e.target.value)} className={input}>
                                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </Field>
                        <Field label="Timezone" error={errors.timezone}>
                            <select value={data.timezone} onChange={e => setData('timezone', e.target.value)} className={input}>
                                {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </Field>
                    </div>

                    <hr className="border-gray-200" />

                    <Field label="Your Name" error={errors.name}>
                        <input value={data.name} onChange={e => setData('name', e.target.value)}
                            placeholder="Admin User" className={input} />
                    </Field>

                    <Field label="Email Address" error={errors.email}>
                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                            placeholder="admin@company.com" className={input} />
                    </Field>

                    <Field label="Password" error={errors.password}>
                        <input type="password" value={data.password} onChange={e => setData('password', e.target.value)}
                            placeholder="Min. 8 characters" className={input} />
                    </Field>

                    <Field label="Confirm Password" error={errors.password_confirmation}>
                        <input type="password" value={data.password_confirmation}
                            onChange={e => setData('password_confirmation', e.target.value)}
                            placeholder="Repeat password" className={input} />
                    </Field>

                    <div className="flex gap-3 pt-2">
                        <a href={route('installer.database')}
                            className="flex-1 py-2.5 text-center border rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium">
                            ← Back
                        </a>
                        <button type="submit" disabled={processing}
                            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold disabled:opacity-60">
                            {processing ? 'Saving...' : 'Continue →'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const input = 'mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function Field({ label, error, children }) {
    return (
        <div>
            <label className="text-xs font-medium text-gray-600">{label}</label>
            {children}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}

function StepIndicator({ step }) {
    const steps = ['Requirements', 'Database', 'Admin', 'Complete'];
    return (
        <div className="flex items-center gap-2">
            {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center
                        ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {i < step ? '✓' : i + 1}
                    </div>
                    {i < steps.length - 1 && <div className={`h-0.5 w-6 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
                </div>
            ))}
        </div>
    );
}
