import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Clock, CheckCircle, AlertOctagon, XCircle } from 'lucide-react';
import clsx from 'clsx';
import Skeleton from '../components/Skeleton';

interface User { id: number; name: string; }

interface MaintenanceRequest {
    id: number;
    subject: string;
    stage: string;
    equipment_id?: number;
    equipment?: { id: number; name: string };
    work_center_id?: number;
    priority: string;
    technician_id?: number; // Changed to number
    scheduled_date?: string;
}

const STAGES = {
    'New Request': { color: 'bg-blue-100 text-blue-800', icon: Clock },
    'In Progress': { color: 'bg-yellow-100 text-yellow-800', icon: AlertOctagon },
    'Repaired': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    'Scrap': { color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function MaintenanceKanban() {
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [draggedReq, setDraggedReq] = useState<MaintenanceRequest | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reqRes, userRes] = await Promise.all([
                api.get('/requests/'),
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

    const fetchRequests = () => {
        // Silent refresh after stage update
        api.get('/requests/')
            .then(res => setRequests(res.data))
            .catch(err => console.error(err));
    };

    const handleStageChange = async (req: MaintenanceRequest, newStage: string) => {
        try {
            await api.put(`/requests/${req.id}`, { stage: newStage });
            fetchRequests(); // Refresh
        } catch (err) {
            console.error("Failed to update stage", err);
        }
    };

    const getRequestsByStage = (stage: string) => {
        return requests.filter(r => r.stage === stage);
    };

    const getUserName = (id?: number) => {
        if (!id) return null;
        return users.find(u => u.id === id)?.name;
    };

    const isOverdue = (req: MaintenanceRequest) => {
        if (!req.scheduled_date) return false;
        if (req.stage === 'Repaired' || req.stage === 'Scrap') return false;
        return new Date(req.scheduled_date) < new Date();
    };

    const getPriorityStars = (priority: string) => {
        const pMap: Record<string, number> = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 3 };
        const stars = pMap[priority] || 0;
        return (
            <div className="flex text-yellow-500">
                {[...Array(stars)].map((_, i) => (
                    <span key={i}>★</span>
                ))}
            </div>
        );
    };

    return (
        <div className="h-full flex overflow-x-auto gap-4 pb-4 px-2">
            {Object.entries(STAGES).map(([stageName, config]) => {
                const requestsInStage = getRequestsByStage(stageName);
                const count = loading ? 0 : requestsInStage.length;

                return (
                    <div key={stageName} className="flex-shrink-0 w-80 flex flex-col max-h-full">
                        {/* Odoo Style Column Header */}
                        <div className="flex items-center justify-between mb-2 px-1 group cursor-pointer">
                            <h3 className="font-bold text-gray-800 text-base">{stageName}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 font-bold text-sm">{loading ? '-' : count}</span>
                                <button className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-600">
                                    <span className="text-xl leading-none">+</span>
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1 w-full bg-gray-200 rounded mb-3 overflow-hidden flex">
                            <div className={`h-full ${count > 0 ? 'bg-[#714B67]' : 'bg-transparent'} w-3/4`}></div>
                            <div className={`h-full ${count > 0 ? 'bg-yellow-400' : 'bg-transparent'} w-1/4`}></div>
                        </div>

                        {/* Cards Container */}
                        <div
                            className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-[150px]"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (draggedReq && draggedReq.stage !== stageName) {
                                    handleStageChange(draggedReq, stageName);
                                    setDraggedReq(null);
                                }
                            }}
                        >
                            {loading ? (
                                // Skeleton Loader
                                <>
                                    <div className="bg-white p-3 rounded border border-gray-200">
                                        <Skeleton height={20} width="80%" className="mb-2" />
                                        <Skeleton height={14} width="40%" className="mb-2" />
                                        <div className="flex justify-between items-center mt-2">
                                            <Skeleton width={40} height={14} />
                                            <Skeleton circle width={24} height={24} />
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded border border-gray-200 opacity-60">
                                        <Skeleton height={20} width="60%" className="mb-2" />
                                        <Skeleton height={14} width="30%" className="mb-2" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {requestsInStage.map(req => {
                                        const overdue = isOverdue(req);
                                        const techName = getUserName(req.technician_id);
                                        return (
                                            <div
                                                key={req.id}
                                                className={clsx(
                                                    "bg-white p-3 rounded border border-gray-200 shadow-sm hover:shadow transition-shadow cursor-pointer group relative",
                                                    overdue ? "border-l-4 border-l-red-500" : ""
                                                )}
                                                draggable
                                                onDragStart={() => setDraggedReq(req)}
                                                onClick={() => navigate(`/requests/${req.id}`)}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-snug w-full hover:text-[#714B67]" title={req.subject}>
                                                        {req.subject}
                                                    </h4>
                                                </div>

                                                <div className="text-xs text-gray-500 mb-2">
                                                    {req.equipment ? (
                                                        <span
                                                            className="hover:text-[#00A09D] hover:underline"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/equipment/${req.equipment?.id}`);
                                                            }}
                                                        >
                                                            {req.equipment.name}
                                                        </span>
                                                    ) : req.equipment_id ? (
                                                        <span>Eq #{req.equipment_id} (No Name)</span>
                                                    ) : (
                                                        <span>WC: {req.work_center_id || 'Global'}</span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex gap-1">
                                                        {getPriorityStars(req.priority)}
                                                    </div>

                                                    {techName && (
                                                        <div
                                                            className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-700 border border-white shadow-sm"
                                                            title={techName}
                                                        >
                                                            <img
                                                                src={`https://ui-avatars.com/api/?name=${techName}&background=random&color=fff&size=24`}
                                                                alt={techName}
                                                                className="w-full h-full rounded"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Activity Icon (Placeholder) */}
                                                {overdue && <Clock size={14} className="absolute bottom-3 left-3 text-red-500" />}
                                            </div>
                                        );
                                    })}

                                    {/* Empty State / Ghost Drop Target */}
                                    {requestsInStage.length === 0 && (
                                        <div className="h-16 border-2 border-dashed border-gray-100 rounded flex items-center justify-center text-gray-300 text-xs">
                                            Drag & Drop here
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    );
}
