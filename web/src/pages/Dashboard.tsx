import { useEffect, useState } from 'react';
import api from '../api';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Skeleton from '../components/Skeleton';

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
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [reports, setReports] = useState<{ requests_per_team: { name: string, count: number }[], requests_per_category: { name: string, count: number }[] } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, reqRes, repRes] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/dashboard/recent_requests'),
                api.get('/dashboard/reports')
            ]);
            setStats(statsRes.data);
            setRecentRequests(reqRes.data);
            setReports(repRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

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

            {/* Reports Section */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <Skeleton width={200} height={24} className="mb-4" />
                        <div className="space-y-4">
                            <Skeleton height={20} />
                            <Skeleton height={20} width="90%" />
                            <Skeleton height={20} width="80%" />
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <Skeleton width={200} height={24} className="mb-4" />
                        <div className="space-y-4">
                            <Skeleton height={20} />
                            <Skeleton height={20} width="90%" />
                            <Skeleton height={20} width="80%" />
                        </div>
                    </div>
                </div>
            ) : (
                reports && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Team Report */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Requests per Team</h3>
                            <div className="space-y-3">
                                {reports.requests_per_team.map(item => (
                                    <div key={item.name} className="flex flex-col">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{item.name}</span>
                                            <span className="text-gray-500">{item.count}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${Math.min((item.count / 10) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {reports.requests_per_team.length === 0 && <p className="text-gray-400 text-sm">No data available</p>}
                            </div>
                        </div>

                        {/* Category Report */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Requests per Category</h3>
                            <div className="space-y-3">
                                {reports.requests_per_category.map(item => (
                                    <div key={item.name} className="flex flex-col">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{item.name}</span>
                                            <span className="text-gray-500">{item.count}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className="bg-purple-600 h-2 rounded-full"
                                                style={{ width: `${Math.min((item.count / 10) * 100, 100)}%` }} // Scaling for demo
                                            />
                                        </div>
                                    </div>
                                ))}
                                {reports.requests_per_category.length === 0 && <p className="text-gray-400 text-sm">No data available</p>}
                            </div>
                        </div>
                    </div>
                )
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {loading || !stats ? (
                    <>
                        <Skeleton height={150} className="rounded-xl" />
                        <Skeleton height={150} className="rounded-xl" />
                        <Skeleton height={150} className="rounded-xl" />
                    </>
                ) : (
                    <>
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
                    </>
                )}
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
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton height={20} width="80%" /></td>
                                        <td className="px-6 py-4"><Skeleton height={20} width="60%" /></td>
                                        <td className="px-6 py-4"><Skeleton height={20} width="60%" /></td>
                                        <td className="px-6 py-4"><Skeleton height={20} width="50%" /></td>
                                        <td className="px-6 py-4"><Skeleton height={24} width={80} className="rounded-full" /></td>
                                        <td className="px-6 py-4"><Skeleton height={20} width="70%" /></td>
                                    </tr>
                                ))
                            ) : (
                                <>
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
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
}
