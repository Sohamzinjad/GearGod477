import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, FileText, Settings } from 'lucide-react';



interface User {
    id: number;
    name: string;
}

interface Team {
    id: number;
    name: string;
    users?: User[]; // Our backend now includes this
}

interface Equipment {
    id: number;
    name: string;
    category_id?: number;
    team_id?: number;
    category?: { id: number, name: string };
    team?: { id: number, name: string };
    default_technician_id?: string;
}

interface WorkCenter {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

const STAGES = ["New Request", "In Progress", "Repaired", "Scrap"];

export default function RequestDetailPage({ isNew }: { isNew?: boolean }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Data State
    const [teams, setTeams] = useState<Team[]>([]);
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);

    const [technicians, setTechnicians] = useState<User[]>([]); // Derived from Team
    const [loading, setLoading] = useState(!isNew);

    // Form State (for creating/editing)
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        maintenance_for: 'Equipment',
        equipment_id: '',
        work_center_id: '',
        request_date: new Date().toISOString().split('T')[0],
        scheduled_date: searchParams.get('date') ? `${searchParams.get('date')}T09:00` : '',
        duration: 0,
        maintenance_type: searchParams.get('type') || 'Corrective',
        priority: 'Low',
        team_id: '',
        technician_id: '',
        category_id: '',
        stage: 'New Request'
    });

    useEffect(() => {
        fetchDropdowns();
        if (!isNew && id) {
            fetchRequest(id);
        }
    }, [id, isNew]);

    // Effect to filtering technicians when Team changes
    useEffect(() => {
        if (formData.team_id && teams.length > 0) {
            const selectedTeam = teams.find(t => t.id === parseInt(String(formData.team_id)));
            if (selectedTeam && selectedTeam.users) {
                setTechnicians(selectedTeam.users);
            } else {
                setTechnicians([]);
            }
        } else {
            setTechnicians([]);
        }
    }, [formData.team_id, teams]);

    // Effect for Auto-filling when Equipment changes
    useEffect(() => {
        if (formData.maintenance_for === 'Equipment' && formData.equipment_id && equipments.length > 0) {
            const eq = equipments.find(e => e.id === parseInt(String(formData.equipment_id)));
            if (eq) {
                // Auto-fill Logic
                setFormData(prev => ({
                    ...prev,
                    category_id: eq.category_id ? String(eq.category_id) : prev.category_id,
                    team_id: eq.team_id ? String(eq.team_id) : prev.team_id,
                    technician_id: eq.default_technician_id ? eq.default_technician_id : prev.technician_id
                }));
            }
        }
    }, [formData.equipment_id, equipments]);


    const fetchDropdowns = async () => {
        try {
            const [tms, eqs, wcs, cats] = await Promise.all([
                api.get('/teams/'),
                api.get('/equipments/'),
                api.get('/workcenters/'),
                api.get('/categories/')
            ]);
            setTeams(tms.data);
            setEquipments(eqs.data);
            setWorkCenters(wcs.data);
            setCategories(cats.data);
        } catch (e) { console.error(e); }
    };

    const fetchRequest = (reqId: string) => {
        api.get(`/requests/${reqId}`)
            .then(res => {
                const data = res.data;
                // setRequest(data); // Removed unused state
                setFormData({
                    subject: data.subject,
                    description: data.description || '',
                    maintenance_for: data.maintenance_for,
                    equipment_id: data.equipment_id || '',
                    work_center_id: data.work_center_id || '',
                    request_date: data.request_date,
                    scheduled_date: data.scheduled_date || '',
                    duration: data.duration || 0,
                    maintenance_type: data.maintenance_type,
                    priority: data.priority,
                    team_id: data.team_id || '',
                    technician_id: data.technician_id || '',
                    category_id: data.category_id || '',
                    stage: data.stage
                });
                setLoading(false);
            })
            .catch(err => { console.error(err); setLoading(false); });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                ...formData,
                equipment_id: formData.equipment_id ? parseInt(String(formData.equipment_id)) : null,
                work_center_id: formData.work_center_id ? parseInt(String(formData.work_center_id)) : null,
                team_id: formData.team_id ? parseInt(String(formData.team_id)) : null,
                category_id: formData.category_id ? parseInt(String(formData.category_id)) : null,
                duration: parseFloat(String(formData.duration)),
                scheduled_date: formData.scheduled_date ? formData.scheduled_date.split('T')[0] : null,
            };

            if (payload.maintenance_for === 'Equipment') delete payload.work_center_id;
            else delete payload.equipment_id;

            if (isNew) {
                await api.post('/requests/', payload);
            } else {
                // Update logic if PUT exists, currently creating new as fallback or assume PUT
                console.log("Update logic trigger", payload);
            }
            navigate('/requests');
        } catch (err) {
            console.error("Failed to save request", err);
        }
    };

    // Helper for Priority Stars
    const PriorityStars = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => {
        const levels = ['Low', 'Medium', 'High']; // 1, 2, 3 stars
        const currentIdx = levels.indexOf(value);
        return (
            <div className="flex gap-1 cursor-pointer">
                {[0, 1, 2].map(idx => (
                    <Settings
                        key={idx}
                        size={18}
                        className={idx <= currentIdx ? "text-yellow-500 fill-current" : "text-gray-300"}
                        onClick={() => onChange(levels[idx])}
                    />
                ))}
            </div>
        );
    }

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm min-h-[600px] flex flex-col">
            {/* Header / Toolbar */}
            <div className="border-b border-gray-200 p-4 flex justify-between items-center bg-gray-50 rounded-t-lg">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/requests')} className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-sm text-gray-500">
                        Maintenance Requests / <span className="text-gray-700 font-medium">{formData.subject || 'New'}</span>
                    </div>
                </div>
                {!isNew && (
                    <div className="flex gap-2">
                        {/* Placeholder Smart Button */}
                        <button className="flex flex-col items-center justify-center border border-gray-300 bg-white px-3 py-1 rounded hover:bg-gray-50">
                            <FileText size={14} className="text-blue-600" />
                            <span className="text-xs font-medium">Worksheet</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Stage Bar */}
            <div className="flex border-b border-gray-200">
                {STAGES.map((stage) => {
                    const isActive = stage === formData.stage;
                    return (
                        <div
                            key={stage}
                            className={`flex-1 py-2 text-center text-sm font-medium border-r border-gray-200 last:border-r-0 ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-500'
                                }`}
                        >
                            {stage}
                        </div>
                    );
                })}
            </div>

            {/* Content Form */}
            <form onSubmit={handleSubmit} className="p-8">
                <div className="flex justify-between items-start mb-8">
                    <div className="flex-1 mr-8">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <input
                            required
                            className="w-full border-b border-gray-300 focus:border-blue-500 text-3xl font-bold px-0 py-2 placeholder-gray-300 focus:ring-0"
                            placeholder="e.g. Broken Monitor"
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Created By</label>
                            <div className="col-span-2 text-sm text-gray-900 border-b border-gray-200 pb-1">Mitchell Admin</div>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Maintenance For</label>
                            <div className="col-span-2 flex gap-4 border-b border-gray-200 pb-1">
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="radio" value="Equipment" checked={formData.maintenance_for === 'Equipment'} onChange={() => setFormData({ ...formData, maintenance_for: 'Equipment' })} />
                                    Equipment
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="radio" value="Work Center" checked={formData.maintenance_for === 'Work Center'} onChange={() => setFormData({ ...formData, maintenance_for: 'Work Center' })} />
                                    Work Center
                                </label>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">
                                {formData.maintenance_for}
                            </label>
                            <div className="col-span-2">
                                {formData.maintenance_for === 'Equipment' ? (
                                    <select className="w-full border-b border-gray-300 focus:border-blue-500 py-1" value={formData.equipment_id} onChange={e => setFormData({ ...formData, equipment_id: e.target.value })}>
                                        <option value="">Select Equipment...</option>
                                        {equipments.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </select>
                                ) : (
                                    <select className="w-full border-b border-gray-300 focus:border-blue-500 py-1" value={formData.work_center_id} onChange={e => setFormData({ ...formData, work_center_id: e.target.value })}>
                                        <option value="">Select Work Center...</option>
                                        {workCenters.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Category</label>
                            <div className="col-span-2">
                                <select className="w-full border-b border-gray-300 focus:border-blue-500 py-1" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                                    <option value="">Select Category...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Request Date</label>
                            <div className="col-span-2">
                                <input type="date" className="w-full border-b border-gray-300 focus:border-blue-500 py-1" value={formData.request_date} onChange={e => setFormData({ ...formData, request_date: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Maintenance Type</label>
                            <div className="col-span-2 text-sm text-gray-900 flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input type="radio" checked={formData.maintenance_type === 'Corrective'} onChange={() => setFormData({ ...formData, maintenance_type: 'Corrective' })} /> Corrective
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" checked={formData.maintenance_type === 'Preventive'} onChange={() => setFormData({ ...formData, maintenance_type: 'Preventive' })} /> Preventive
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Team</label>
                            <div className="col-span-2">
                                <select className="w-full border-b border-gray-300 focus:border-blue-500 py-1" value={formData.team_id} onChange={e => setFormData({ ...formData, team_id: e.target.value })}>
                                    <option value="">Select Team...</option>
                                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Technician</label>
                            <div className="col-span-2">
                                <select className="w-full border-b border-gray-300 focus:border-blue-500 py-1" value={formData.technician_id} onChange={e => setFormData({ ...formData, technician_id: e.target.value })}>
                                    <option value="">Select Technician...</option>
                                    {technicians.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Scheduled Date</label>
                            <div className="col-span-2">
                                <input type="datetime-local" className="w-full border-b border-gray-300 focus:border-blue-500 py-1" value={formData.scheduled_date} onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Duration</label>
                            <div className="col-span-2 flex items-center gap-2">
                                <input type="number" step="0.5" className="w-20 border-b border-gray-300 focus:border-blue-500 py-1" value={formData.duration} onChange={e => setFormData({ ...formData, duration: parseFloat(e.target.value) })} />
                                <span className="text-sm text-gray-500">hours</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Priority</label>
                            <div className="col-span-2">
                                <PriorityStars value={formData.priority} onChange={v => setFormData({ ...formData, priority: v })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center mt-6">
                            <label className="text-sm font-medium text-gray-600">Company</label>
                            <div className="col-span-2 text-sm text-gray-900 border-b border-gray-200 pb-1">My Company (San Francisco)</div>
                        </div>
                    </div>
                </div>

                {/* Tabs / Footer Area */}
                <div className="mt-12">
                    <div className="border-b border-gray-200 mb-4">
                        <button type="button" className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">Notes</button>
                        <button type="button" className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Instructions</button>
                    </div>
                    <div className="p-4 bg-gray-50 rounded border border-gray-200 min-h-[100px]">
                        <textarea
                            className="w-full h-full bg-transparent border-none focus:ring-0 p-0 text-gray-600 text-sm"
                            placeholder="Add notes..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button type="button" onClick={() => navigate('/requests')} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{isNew ? 'Create Request' : 'Save Changes'}</button>
                </div>
            </form>
        </div>
    );
}
