import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/register', { name, email, password });
            navigate('/login');
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB] font-sans">
            <div className="w-full max-w-md bg-white p-8 rounded shadow-sm border border-gray-200">
                <div className="text-center mb-8">
                    <div className="mx-auto h-12 w-12 bg-[#714B67] rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">
                        G
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
                    <p className="text-sm text-gray-500 mt-2">Start using GearGuard for free.</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm mb-6 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            placeholder="John Doe"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] transition-all"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            placeholder="name@company.com"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] transition-all"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] transition-all"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-[#714B67] text-white py-2.5 rounded font-medium text-sm hover:bg-[#5d3d54] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#714B67] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>
                <p className="mt-8 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="text-[#714B67] hover:underline font-medium">Sign in</Link>
                </p>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
                    Powered by GearGuard ERP
                </div>
            </div>
        </div>
    );
}
