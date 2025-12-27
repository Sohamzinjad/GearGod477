import { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Skeleton from '../components/Skeleton';

interface Category { id: number; name: string; }
interface Team { id: number; name: string; }

interface MaintenanceRequest {
    id: number;
    subject: string;
    request_date: string;
    stage: string;
    maintenance_for: 'Equipment' | 'Work Center';
    employee?: string;
    technician_id?: string;
    category?: Category;
    team?: Team;
    company?: string;
    created_by_id?: number;
}

interface User { id: number; name: string; }

export default function RequestsPage() {
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const equipmentId = searchParams.get('equipment_id');

    useEffect(() => {
        fetchData();
    }, [equipmentId]);

    const fetchData = async () => {
        setLoading(true);
        const params: any = {};
        if (equipmentId) params.equipment_id = equipmentId;

        try {
            const [reqRes, userRes] = await Promise.all([
                api.get('/requests/', { params }),
                api.get('/auth/members')
            ]);
            setRequests(reqRes.data);
            setUsers(userRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getUserName = (id?: string | number) => {
        if (!id) return '-';
        return users.find(u => u.id === parseInt(String(id)))?.name || '-';
    };

    return (
        <div className="requests-page h-full flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Maintenance Requests</h2>
                    <button
                        onClick={() => navigate('/requests/new')}
                        className="btn flex items-center gap-1 text-sm bg-[#714B67] text-white px-4 py-1.5 rounded hover:bg-[#5d3d54] shadow-sm transition-colors"
                    >
                        <Plus size={16} /> New
                    </button>
                    {equipmentId && (
                        <div className="flex items-center gap-2 bg-[#00A09D]/10 text-[#00A09D] px-3 py-1 rounded-full text-sm font-medium border border-[#00A09D]/20">
                            <span>Filtered by Equipment #{equipmentId}</span>
                            <button onClick={() => navigate('/requests')} className="hover:text-[#007e7b] font-bold">×</button>
                        </div>
                    )}
                </div>
                <div className="relative w-96">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#714B67] focus:border-[#714B67] transition-all"
                    />
                </div>
            </div>

            {/* List Table */}
            <div className="flex-1 overflow-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3">Subject</th>
                            <th className="px-6 py-3">Created By</th>
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
                                {requests.map(req => (
                                    <tr
                                        key={req.id}
                                        onClick={() => navigate(`/requests/${req.id}`)}
                                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-3 font-medium text-gray-900">{req.subject}</td>
                                        <td className="px-6 py-3 text-gray-600">{getUserName(req.created_by_id)}</td>
                                        <td className="px-6 py-3 text-gray-600">{getUserName(req.technician_id)}</td>
                                        <td className="px-6 py-3 text-gray-600">{req.category?.name || '-'}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${req.stage === 'New Request' ? 'bg-blue-100 text-blue-700' :
                                                req.stage === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                                                    req.stage === 'Repaired' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {req.stage}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-gray-600">{req.company || 'My Company (San Francisco)'}</td>
                                    </tr>
                                ))}
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


