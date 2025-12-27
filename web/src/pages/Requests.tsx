import { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
}

export default function RequestsPage() {
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const equipmentId = searchParams.get('equipment_id');

    useEffect(() => {
        fetchRequests();
    }, [equipmentId]);

    const fetchRequests = () => {
        const params: any = {};
        if (equipmentId) params.equipment_id = equipmentId;

        api.get('/requests/', { params })
            .then(res => setRequests(res.data))
            .catch(err => console.error(err));
    };

    return (
        <div className="requests-page h-full flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Maintenance Requests</h2>
                    <button
                        onClick={() => navigate('/requests/new')}
                        className="btn btn-primary flex items-center gap-1 text-sm bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700"
                    >
                        <Plus size={16} /> New
                    </button>
                </div>
                <div className="relative w-96">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* List Table */}
            <div className="flex-1 overflow-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3">Subject</th>
                            <th className="px-6 py-3">Employee</th>
                            <th className="px-6 py-3">Technician</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Stage</th>
                            <th className="px-6 py-3">Company</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {requests.map(req => (
                            <tr
                                key={req.id}
                                onClick={() => navigate(`/requests/${req.id}`)}
                                className="hover:bg-blue-50 cursor-pointer transition-colors"
                            >
                                <td className="px-6 py-3 font-medium text-gray-900">{req.subject}</td>
                                <td className="px-6 py-3 text-gray-600">{req.employee || 'Mitchell Admin'}</td>
                                <td className="px-6 py-3 text-gray-600">{req.technician_id || '-'}</td>
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
                    </tbody>
                </table>
            </div>
        </div>
    );
}


