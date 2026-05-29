import { Head } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

export default function Complete({ ready }) {
    const [status, setStatus]   = useState('idle'); // idle | running | done | error
    const [message, setMessage] = useState('');

    async function runInstall() {
        setStatus('running');
        setMessage('');

        try {
            const res = await axios.post(route('installer.run'));
            if (res.data.success) {
                setStatus('done');
                setTimeout(() => { window.location.href = res.data.redirect; }, 2000);
            }
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.error || 'An unexpected error occurred.');
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
            <Head title="Complete Setup — AI-FMS" />

            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center">
                <StepIndicator step={3} />

                {status === 'done' ? (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mt-6">
                            <span className="text-green-600 text-3xl">✓</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mt-4">Installation Complete!</h2>
                        <p className="text-gray-500 mt-2">Redirecting to login page...</p>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-gray-900 mt-4">Ready to Install</h2>
                        <p className="text-gray-500 text-sm mt-2">
                            Click the button below to run database migrations, seed initial data, and create your admin account.
                        </p>

                        {!ready && (
                            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-700">
                                Setup data is missing. Please go back and complete all steps.
                            </div>
                        )}

                        {message && (
                            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 text-left">
                                {message}
                            </div>
                        )}

                        <div className="mt-8 space-y-3 text-left bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                            <p className="font-medium text-gray-800">This will:</p>
                            <ul className="space-y-1.5 list-disc list-inside">
                                <li>Run all database migrations</li>
                                <li>Create roles and permissions</li>
                                <li>Create your company and admin account</li>
                                <li>Mark the system as installed</li>
                            </ul>
                        </div>

                        <button onClick={runInstall} disabled={!ready || status === 'running'}
                            className="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition">
                            {status === 'running' ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Installing...
                                </span>
                            ) : 'Install AI-FMS →'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

function StepIndicator({ step }) {
    const steps = ['Requirements', 'Database', 'Admin', 'Complete'];
    return (
        <div className="flex items-center gap-2 justify-center">
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
