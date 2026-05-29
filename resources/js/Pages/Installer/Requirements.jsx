import { Head, Link } from '@inertiajs/react';

export default function Requirements({ requirements, allMet }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
            <Head title="Requirements — AI-FMS" />

            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
                <StepIndicator step={1} />

                <h2 className="text-2xl font-bold text-gray-900 mt-4">System Requirements</h2>
                <p className="text-gray-500 text-sm mt-1">Checking if your server meets all requirements.</p>

                <div className="mt-6 space-y-2">
                    {requirements.map(req => (
                        <div key={req.name} className="flex items-center justify-between py-2.5 border-b last:border-0">
                            <span className="text-sm text-gray-700">{req.name}</span>
                            <span className={`text-sm font-semibold ${req.met ? 'text-green-600' : 'text-red-600'}`}>
                                {req.met ? '✓ OK' : '✗ Missing'}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex gap-3">
                    <Link href={route('installer.welcome')}
                        className="flex-1 py-2.5 text-center border rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium">
                        ← Back
                    </Link>
                    {allMet ? (
                        <Link href={route('installer.database')}
                            className="flex-1 py-2.5 text-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold">
                            Continue →
                        </Link>
                    ) : (
                        <span className="flex-1 py-2.5 text-center bg-gray-200 text-gray-500 rounded-xl text-sm font-semibold cursor-not-allowed">
                            Fix Issues First
                        </span>
                    )}
                </div>
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
