import { Head, Link } from '@inertiajs/react';

export default function Welcome({ appVersion }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
            <Head title="Install AI-FMS" />

            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-white text-2xl font-bold">AI</span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900">AI-FMS Installer</h1>
                <p className="text-gray-500 mt-2">Version {appVersion}</p>

                <p className="text-gray-600 mt-6 leading-relaxed">
                    Welcome to the AI Financial Management System setup wizard.
                    This will guide you through installing and configuring the system.
                </p>

                <div className="mt-8 space-y-3 text-left bg-gray-50 rounded-xl p-4">
                    {[
                        { step: '1', label: 'Check Requirements' },
                        { step: '2', label: 'Configure Database' },
                        { step: '3', label: 'Create Admin Account' },
                        { step: '4', label: 'Complete Setup' },
                    ].map(s => (
                        <div key={s.step} className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                                {s.step}
                            </span>
                            <span className="text-gray-700">{s.label}</span>
                        </div>
                    ))}
                </div>

                <Link href={route('installer.requirements')}
                    className="mt-8 block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition">
                    Begin Installation →
                </Link>
            </div>
        </div>
    );
}
