import { Head, useForm } from '@inertiajs/react';

export default function Database({ env }) {
    const { data, setData, post, processing, errors } = useForm({
        host:     env.host,
        port:     env.port,
        database: env.database,
        username: env.username,
        password: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('installer.database.save'));
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
            <Head title="Database — AI-FMS" />

            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
                <StepIndicator step={1} />

                <h2 className="text-2xl font-bold text-gray-900 mt-4">Database Configuration</h2>
                <p className="text-gray-500 text-sm mt-1">Enter your MySQL database credentials.</p>

                <form onSubmit={submit} className="mt-6 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <label className="text-xs font-medium text-gray-600">Host</label>
                            <input value={data.host} onChange={e => setData('host', e.target.value)}
                                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            {errors.host && <p className="text-red-500 text-xs mt-1">{errors.host}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-600">Port</label>
                            <input value={data.port} onChange={e => setData('port', e.target.value)}
                                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>

                    {[
                        { key: 'database', label: 'Database Name' },
                        { key: 'username', label: 'Username' },
                        { key: 'password', label: 'Password', type: 'password' },
                    ].map(f => (
                        <div key={f.key}>
                            <label className="text-xs font-medium text-gray-600">{f.label}</label>
                            <input type={f.type || 'text'} value={data[f.key]} onChange={e => setData(f.key, e.target.value)}
                                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            {errors[f.key] && <p className="text-red-500 text-xs mt-1">{errors[f.key]}</p>}
                        </div>
                    ))}

                    {errors.database && (
                        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                            {errors.database}
                        </p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <a href={route('installer.requirements')}
                            className="flex-1 py-2.5 text-center border rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium">
                            ← Back
                        </a>
                        <button type="submit" disabled={processing}
                            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold disabled:opacity-60">
                            {processing ? 'Testing...' : 'Test & Continue →'}
                        </button>
                    </div>
                </form>
            </div>
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
