import { useEffect, useState } from 'react';
import api from '../api';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
    critical_equipment_count: number;
    technician_load: number;
    open_requests_count: number;
    overdue_requests_count: number;
}

interface RecentRequest {
    id: number;
    subject: string;
    employee: string;
    technician: string;
    category: string;
    stage: string;
    company: string;
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/dashboard/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error("Failed to fetch dashboard stats", err));

        api.get('/dashboard/recent_requests')
            .then(res => setRecentRequests(res.data))
            .catch(err => console.error("Failed to fetch recent requests", err));
    }, []);

    if (!stats) return <div className="p-8">Loading dashboard...</div>;

    return (
        <div className="dashboard h-full flex flex-col">
            {/* Top Bar for Dashboard View (Mockup has it below Tabs) */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate('/requests')}
                    className="btn border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-1 shadow-sm px-4 py-1.5 rounded"
                >
                    <span className="font-semibold text-lg">New</span>
                </button>

                <div className="relative w-96">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div className="w-16"></div> {/* Spacer to center search visually if needed */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Critical Equipment */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <h3 className="text-red-600 font-semibold mb-2">Critical Equipment</h3>
                    <div className="text-4xl font-bold text-red-700 mb-1">{stats.critical_equipment_count} Units</div>
                    <p className="text-red-500 text-sm">(Health &lt; 30%)</p>
                </div>

                {/* Technician Load */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <h3 className="text-blue-600 font-semibold mb-2">Technician Load</h3>
                    <div className="text-4xl font-bold text-blue-700 mb-1">{stats.technician_load}% Utilized</div>
                    <p className="text-blue-500 text-sm">(Assign Carefully)</p>
                </div>

                {/* Open Requests */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <h3 className="text-green-600 font-semibold mb-2">Open Requests</h3>
                    <div className="text-2xl font-bold text-green-700 mb-1">
                        {stats.open_requests_count} Pending
                    </div>
                    <p className="text-green-600 font-bold">{stats.overdue_requests_count} Overdue</p>
                </div>
            </div>

            {/* Recent Requests Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex-1 overflow-hidden flex flex-col">
                <div className="overflow-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-white text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">Subjects</th>
                                <th className="px-6 py-3">Employee</th>
                                <th className="px-6 py-3">Technician</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Stage</th>
                                <th className="px-6 py-3">Company</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentRequests.map((req) => (
                                <tr
                                    key={req.id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => navigate(`/requests/${req.id}`)}
                                >
                                    <td className="px-6 py-3 font-medium text-gray-900">{req.subject}</td>
                                    <td className="px-6 py-3 text-gray-600">{req.employee}</td>
                                    <td className="px-6 py-3 text-gray-600">{req.technician}</td>
                                    <td className="px-6 py-3 text-gray-600">{req.category}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${req.stage === 'New Request' ? 'bg-blue-100 text-blue-700' :
                                            req.stage === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                                                req.stage === 'Repaired' ? 'bg-green-100 text-green-700' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            {req.stage}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-gray-600">{req.company}</td>
                                </tr>
                            ))}
                            {recentRequests.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                        No recent requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
