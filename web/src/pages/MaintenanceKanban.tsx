import { useEffect, useState } from 'react';
import api from '../api';
import { Clock, CheckCircle, AlertOctagon, XCircle } from 'lucide-react';
import clsx from 'clsx';

interface MaintenanceRequest {
    id: number;
    subject: string;
    stage: string;
    equipment_id?: number;
    work_center_id?: number;
    priority: string;
    technician_id: string;
}

const STAGES = {
    'New Request': { color: 'bg-blue-100 text-blue-800', icon: Clock },
    'In Progress': { color: 'bg-yellow-100 text-yellow-800', icon: AlertOctagon },
    'Repaired': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    'Scrap': { color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function MaintenanceKanban() {
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [draggedReq, setDraggedReq] = useState<MaintenanceRequest | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = () => {
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
                        <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-3">
                            {getRequestsByStage(stageName).map(req => (
                                <div
                                    key={req.id}
                                    className="card bg-white p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                                    draggable
                                    onDragStart={() => setDraggedReq(req)}
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
                                        <span className="text-xs text-gray-400">#{req.id}</span>
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-1">{req.subject}</h4>
                                    <p className="text-sm text-gray-500 mb-3">
                                        {req.equipment_id ? `Eq: ${req.equipment_id}` : `WC: ${req.work_center_id}`}
                                    </p>

                                    {/* Actions (Simple Dropdown for non-DnD fallback) */}
                                    <select
                                        className="w-full text-xs border-gray-200 rounded p-1"
                                        value={req.stage}
                                        onChange={(e) => handleStageChange(req, e.target.value)}
                                        onClick={(e) => e.stopPropagation()} // Prevent card click
                                    >
                                        {Object.keys(STAGES).map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>

                        {/* DnD Target (Invisible Overlay for simplicity in this prototype) */}
                        <div
                            className="h-10 border-2 border-dashed border-gray-200 rounded m-3 flex items-center justify-center text-gray-400 text-sm"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (draggedReq && draggedReq.stage !== stageName) {
                                    handleStageChange(draggedReq, stageName);
                                    setDraggedReq(null);
                                }
                            }}
                        >
                            Drop here
                        </div>

                    </div>
                )
            })}
        </div>
    );
}
