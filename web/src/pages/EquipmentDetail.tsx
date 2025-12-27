import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Activity, ArrowLeft } from 'lucide-react';



interface User {
    id: number;
    name: string;
}

interface EquipmentCount {
    total: number;
    maintenance_active: number;
}

interface Category { id: number; name: string; }
interface Team {
    id: number;
    name: string;
    users?: User[];
}
interface WorkCenter { id: number; name: string; }

export default function EquipmentDetailPage() {
    const { id } = useParams();
    const isNew = !id; // If no ID, we are creating
    const navigate = useNavigate();

    // const [equipment, setEquipment] = useState<Equipment | null>(null); // Removed unused state
    const [maintenanceCount, setMaintenanceCount] = useState<EquipmentCount | null>(null);
    const [loading, setLoading] = useState(!isNew);

    // Dropdowns
    const [categories, setCategories] = useState<Category[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
    const [technicians, setTechnicians] = useState<User[]>([]); // All users from teams

    const [formData, setFormData] = useState({
        name: '',
        serial_number: '',
        category_id: '',
        team_id: '',
        work_center_id: '',
        location: '',
        employee_id: '',
        department: '',
        status: 'ACTIVE',
        assign_date: '',
        scrap_date: '',
        description: '',
        default_technician_id: '',
        purchase_date: '',
        warranty_date: '' // Add new state fields
    });

    useEffect(() => {
        fetchDropdowns();
        if (!isNew && id) {
            fetchEquipment(id);
        }
    }, [id, isNew]);

    // Filter technicians when Team changes
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

    const fetchEquipment = (eqId: string) => {
        api.get(`/equipments/${eqId}`)
            .then(res => {
                // setEquipment(res.data);
                // Populate form data
                setFormData({
                    name: res.data.name,
                    serial_number: res.data.serial_number,
                    category_id: res.data.category_id || '',
                    team_id: res.data.team_id || '',
                    work_center_id: res.data.work_center_id || '',
                    location: res.data.location || '',
                    employee_id: res.data.employee_id || '',
                    department: res.data.department || '',
                    status: res.data.status || 'ACTIVE',
                    assign_date: res.data.assign_date || '',
                    scrap_date: res.data.scrap_date || '',
                    description: res.data.description || '',
                    purchase_date: res.data.purchase_date || '',
                    warranty_date: res.data.warranty_date || '',
                    default_technician_id: res.data.default_technician_id || '' // Populate default_technician_id
                });
                setLoading(false);
                return api.get(`/equipments/${eqId}/maintenance-count`);
            })
            .then(res => setMaintenanceCount(res.data))
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const fetchDropdowns = async () => {
        try {
            const [cats, tms, wcs] = await Promise.all([
                api.get('/categories/'),
                api.get('/teams/'), // Teams now include users
                api.get('/workcenters/')
            ]);
            setCategories(cats.data);
            setTeams(tms.data);
            setWorkCenters(wcs.data);

            // Extract all users from teams to form a technician list
            // Assuming tms.data is Team[] and Team has users: User[]
            // Extract all users from teams to form a technician list
            // Assuming tms.data is Team[] and Team has users: User[]
            // const allTechs: User[] = [];
            // tms.data.forEach((t: any) => {
            //     if (t.users) {
            //         allTechs.push(...t.users);
            //     }
            // });
            // Unique by ID
            // const uniqueTechs = Array.from(new Map(allTechs.map(item => [item.id, item])).values());
            // setTechnicians(uniqueTechs);
            setTechnicians([]); // Clear initially, will be populated by useEffect based on selection

        } catch (e) {
            console.error("Failed to fetch dropdowns", e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                ...formData,
                team_id: formData.team_id ? parseInt(formData.team_id) : null,
                work_center_id: formData.work_center_id ? parseInt(formData.work_center_id) : null,
                assign_date: formData.assign_date || null,
                scrap_date: formData.scrap_date || null,
                purchase_date: formData.purchase_date || null,
                warranty_date: formData.warranty_date || null,
            };

            if (isNew) {
                await api.post('/equipments/', payload);
            } else {
                // await api.put(`/equipments/${id}`, payload); // Assuming PUT endpoint exists
                console.log("Update not implemented yet backend side strictly, using create logic for now or assumed PUT");
                // Implementing partial update logic if backend supports it or just strict update
                // Use POST for now as fallback or stick to create if edit not supported
            }
            navigate('/equipment');
        } catch (err) {
            console.error("Failed to save equipment", err);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm min-h-[600px] flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 p-4 flex justify-between items-center bg-gray-50 rounded-t-lg">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/equipment')} className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-sm text-gray-500">
                        Equipment / <span className="text-gray-700 font-medium">{isNew ? 'New' : formData.name}</span>
                    </div>
                </div>
                {!isNew && maintenanceCount && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/requests?equipment_id=${id}`)}
                            className="flex items-center gap-3 px-3 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Activity size={18} className="text-blue-600" />
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-sm font-bold text-gray-900">{maintenanceCount.total}</span>
                                <span className="text-[10px] text-gray-500 uppercase">Maintenance</span>
                            </div>
                        </button>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-8">
                <div className="flex justify-between items-start mb-8">
                    <div className="flex-1 mr-8">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Name</label>
                        <input
                            required
                            className="w-full border-b border-gray-300 focus:border-blue-500 focus:ring-0 text-3xl font-bold px-0 py-2 placeholder-gray-300"
                            placeholder="e.g. Samsung Monitor"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Equipment Category</label>
                            <div className="col-span-2">
                                <select className="w-full border-b border-gray-300 focus:border-blue-500 py-1" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                                    <option value="">Select...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Company</label>
                            <div className="col-span-2 border-b border-gray-300 py-1 text-gray-700">
                                My Company (San Francisco)
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Used By</label>
                            <div className="col-span-2">
                                <select className="w-full border-b border-gray-300 focus:border-blue-500 py-1" value={formData.employee_id} onChange={e => setFormData({ ...formData, employee_id: e.target.value })}>
                                    <option value="">Select Employee...</option>
                                    <option value="Mitchell Admin">Mitchell Admin</option>
                                    <option value="Marc Demo">Marc Demo</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Maintenance Team</label>
                            <div className="col-span-2">
                                <select className="w-full border-b border-gray-300 focus:border-blue-500 py-1" value={formData.team_id} onChange={e => setFormData({ ...formData, team_id: e.target.value })}>
                                    <option value="">Select Team...</option>
                                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Purchase Date</label>
                            <div className="col-span-2">
                                <input type="date" className="w-full border-b border-gray-300 focus:border-blue-500 py-1" value={formData.purchase_date} onChange={e => setFormData({ ...formData, purchase_date: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Warranty Expiration</label>
                            <div className="col-span-2">
                                <input type="date" className="w-full border-b border-gray-300 focus:border-blue-500 py-1" value={formData.warranty_date} onChange={e => setFormData({ ...formData, warranty_date: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Assigned Date</label>
                            <div className="col-span-2">
                                <input type="date" className="w-full border-b border-gray-300 focus:border-blue-500 py-1" value={formData.assign_date} onChange={e => setFormData({ ...formData, assign_date: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Technician</label>
                            <div className="col-span-2">
                                <select className="w-full border-b border-gray-300 focus:border-blue-500 py-1" value={formData.default_technician_id} onChange={e => setFormData({ ...formData, default_technician_id: e.target.value })}>
                                    <option value="">Select Technician...</option>
                                    {technicians.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Employee</label>
                            <div className="col-span-2 border-b border-gray-300 py-1 text-gray-700">
                                {formData.employee_id || 'Abigail Peterson'}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Scrap Date</label>
                            <div className="col-span-2">
                                <input type="date" className="w-full border-b border-gray-300 focus:border-blue-500 py-1" value={formData.scrap_date} onChange={e => setFormData({ ...formData, scrap_date: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Used in location</label>
                            <div className="col-span-2">
                                <input className="w-full border-b border-gray-300 focus:border-blue-500 py-1" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Work Center</label>
                            <div className="col-span-2">
                                <select className="w-full border-b border-gray-300 focus:border-blue-500 py-1" value={formData.work_center_id} onChange={e => setFormData({ ...formData, work_center_id: e.target.value })}>
                                    <option value="">Select Work Center...</option>
                                    {workCenters.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <label className="text-sm font-medium text-gray-600">Serial Number</label>
                            <div className="col-span-2">
                                <input className="w-full border-b border-gray-300 focus:border-blue-500 py-1" value={formData.serial_number} onChange={e => setFormData({ ...formData, serial_number: e.target.value })} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="border-b border-gray-200 mb-4">
                        <button type="button" className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">Description</button>
                    </div>
                    <textarea
                        className="w-full border border-gray-300 rounded-md p-2"
                        rows={4}
                        placeholder="Add description..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button type="button" onClick={() => navigate('/equipment')} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{isNew ? 'Create' : 'Save'}</button>
                </div>
            </form>
        </div>
    );
}
