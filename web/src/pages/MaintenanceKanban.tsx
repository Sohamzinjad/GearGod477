import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Clock, CheckCircle, AlertOctagon, XCircle } from 'lucide-react';
import clsx from 'clsx';

interface User { id: number; name: string; }

interface MaintenanceRequest {
    id: number;
    subject: string;
    stage: string;
    equipment_id?: number;
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
    const [draggedReq, setDraggedReq] = useState<MaintenanceRequest | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
        fetchUsers();
    }, []);

    const fetchRequests = () => {
        api.get('/requests/')
            .then(res => setRequests(res.data))
            .catch(err => console.error(err));
    };

    const fetchUsers = () => {
        api.get('/auth/members')
            .then(res => setUsers(res.data))
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

    const getInitials = (name?: string) => {
        if (!name) return '??';
        return String(name).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const isOverdue = (req: MaintenanceRequest) => {
        if (!req.scheduled_date) return false;
        if (req.stage === 'Repaired' || req.stage === 'Scrap') return false;
        return new Date(req.scheduled_date) < new Date();
    };

    return (
        <div className="kanban-board h-full flex overflow-x-auto gap-6 pb-4">
            {Object.entries(STAGES).map(([stageName, config]) => {
                const Icon = config.icon;
                return (
                    <div key={stageName} className="kanban-column flex-shrink-0 w-80 bg-gray-50 rounded-lg flex flex-col max-h-full">
                        {/* Column Header */}
                        <div className={`p-3 rounded-t-lg border-b border-gray-200 flex items-center justify-between ${config.color} bg-opacity-50`}>
                            <div className="flex items-center gap-2 font-semibold">
                                <Icon size={18} />
                                <span>{stageName}</span>
                            </div>
                            <span className="bg-white bg-opacity-40 px-2 py-0.5 rounded text-sm font-bold">
                                {getRequestsByStage(stageName).length}
                            </span>
                        </div>

                        {/* Cards Container */}
                        <div
                            className="p-3 flex-1 overflow-y-auto flex flex-col gap-3 min-h-[200px]"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (draggedReq && draggedReq.stage !== stageName) {
                                    handleStageChange(draggedReq, stageName);
                                    setDraggedReq(null);
                                }
                            }}
                        >
                            {getRequestsByStage(stageName).map(req => {
                                const overdue = isOverdue(req);
                                const techName = getUserName(req.technician_id);
                                return (
                                    <div
                                        key={req.id}
                                        className={clsx(
                                            "card bg-white p-3 shadow-sm border hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing rounded relative group",
                                            overdue ? "border-l-4 border-l-red-500 border-y-gray-200 border-r-gray-200" : "border-gray-200"
                                        )}
                                        draggable
                                        onDragStart={() => setDraggedReq(req)}
                                        onClick={() => navigate(`/requests/${req.id}`)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={clsx("text-xs font-bold px-1.5 py-0.5 rounded", {
                                                'bg-red-100 text-red-700': req.priority === 'Critical',
                                                'bg-orange-100 text-orange-700': req.priority === 'High',
                                                'bg-blue-50 text-blue-600': req.priority === 'Medium',
                                                'bg-gray-100 text-gray-600': req.priority === 'Low',
                                            })}>
                                                {req.priority}
                                            </span>
                                            {overdue && (
                                                <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 px-1 rounded ml-auto mr-2">
                                                    Overdue
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-400">#{req.id}</span>
                                        </div>

                                        <h4 className="font-medium text-gray-900 mb-1 line-clamp-2" title={req.subject}>
                                            {req.subject}
                                        </h4>

                                        <div className="mb-3">
                                            {req.equipment_id ? (
                                                <span
                                                    className="text-sm text-blue-600 hover:underline cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/equipment/${req.equipment_id}`);
                                                    }}
                                                >
                                                    Eq: {req.equipment_id}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-500">WC: {req.work_center_id}</span>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                                            <div className="flex items-center gap-2">
                                                {techName && (
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold" title={techName}>
                                                        {getInitials(techName)}
                                                    </div>
                                                )}
                                                <span className="text-xs text-gray-400">
                                                    {techName || 'Unassigned'}
                                                </span>
                                            </div>

                                            {/* Quick Actions overlay */}
                                            {/* <select
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs border-gray-200 rounded p-1"
                                                value={req.stage}
                                                onChange={(e) => {
                                                    e.stopPropagation(); // prevent nav
                                                    handleStageChange(req, e.target.value);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                 {Object.keys(STAGES).map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select> */}
                                        </div>
                                    </div>
                                );
                            })}
                            {/* Empty State / Drop Target Area enhancer */}
                            {getRequestsByStage(stageName).length === 0 && (
                                <div className="h-20 border-2 border-dashed border-gray-200 rounded flex items-center justify-center text-gray-400 text-sm italic">
                                    Drop items here
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    );
}
