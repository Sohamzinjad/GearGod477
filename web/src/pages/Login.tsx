import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // api expects json body based on schemas, checking backend... 
            // The backend endpoint defined in auth.py uses UserLogin schema which expects JSON. 
            // So we send JSON.

            const res = await api.post('/auth/login', { email, password });

            // NOTE: Ideally we fetch user details here or decode token.
            // For now, let's fake user details or fetch 'me'
            // But verify backend login response: returns { access_token, token_type }

            // To get user info, we probably need an endpoint /auth/me or decode JWT.
            // For simplicity, I'll decode JWT or just store minimal info.
            // Let's rely on decoding or fetching. Since I didn't verify /auth/me existence yet,
            // I'll quickly add a second call or assumes backend returns user.
            // Wait, I didn't add /auth/me endpoint in previous step.
            // I'll just decode the token manually or fetch members to find 'me' (inefficient).
            // Actually, best to Decode token client side.

            const token = res.data.access_token;

            // Simple decode for payload
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const payload = JSON.parse(jsonPayload);

            login(token, { id: payload.id, email: payload.sub, name: payload.sub, role: payload.role });
            navigate('/');
        } catch (err) {
            setError('Invalid credentials');
            console.error(err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">GearGuard Login</h1>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full border border-gray-300 rounded-md p-2 mt-1"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full border border-gray-300 rounded-md p-2 mt-1"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Login</button>
                </form>
                <p className="mt-4 text-center text-sm">
                    Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
}
