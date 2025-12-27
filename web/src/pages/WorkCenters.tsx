import { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Search, Factory, Settings, X } from 'lucide-react';

interface WorkCenter {
    id: number;
    name: string;
    code: string;
    capacity: number;
    time_efficiency: number;
    oee_target?: number;
}

export default function WorkCentersPage() {
    const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
    const [selectedWC, setSelectedWC] = useState<WorkCenter | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    // Creation State
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        capacity: 1.0,
        time_efficiency: 100.0,
        oee_target: 85.0
    });

    useEffect(() => {
        fetchWorkCenters();
    }, []);

    const fetchWorkCenters = () => {
        api.get('/workcenters/')
            .then(res => setWorkCenters(res.data))
            .catch(err => console.error(err));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/workcenters/', formData);
            fetchWorkCenters();
            setShowCreate(false);
            setFormData({ name: '', code: '', capacity: 1.0, time_efficiency: 100.0, oee_target: 85.0 });
        } catch (err) {
            console.error("Failed to create work center", err);
        }
    };

    return (
        <div className="work-centers-page flex h-full gap-6">
            {/* List View */}
            <div className="w-1/3 bg-white border border-gray-200 rounded-lg flex flex-col h-full">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Work Centers</h2>
                        <button
                            onClick={() => { setShowCreate(true); setSelectedWC(null); }}
                            className="btn flex items-center gap-1 text-sm bg-[#714B67] text-white px-3 py-1.5 rounded hover:bg-[#5d3d54] shadow-sm transition-colors"
                        >
                            <Plus size={16} /> New
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#714B67] focus:border-[#714B67] transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {workCenters.map(wc => (
                        <div
                            key={wc.id}
                            onClick={() => setSelectedWC(wc)}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedWC?.id === wc.id ? 'bg-[#714B67]/5 border-l-4 border-l-[#714B67]' : 'border-l-4 border-l-transparent'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className={`font-medium ${selectedWC?.id === wc.id ? 'text-[#714B67]' : 'text-gray-900'}`}>{wc.name}</h3>
                                    <p className="text-sm text-gray-500">{wc.code}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail / Create View */}
            <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6 overflow-y-auto">
                {showCreate ? (
                    <form onSubmit={handleCreate} className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">New Work Center</h2>
                            <button type="button" onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Work Center Name</label>
                            <input required className="w-full border border-gray-300 rounded-md p-2 text-lg font-medium"
                                placeholder="e.g. Assembly Line 1"
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>

                        <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 items-center">
                                    <label className="text-sm font-medium text-gray-600">Code</label>
                                    <div className="col-span-2">
                                        <input required className="w-full border border-gray-300 rounded-md p-1.5" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center">
                                    <label className="text-sm font-medium text-gray-600">Working Hours</label>
                                    <div className="col-span-2">
                                        <input className="w-full border border-gray-300 rounded-md p-1.5" value="Standard 40h/week" disabled />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-3 items-center">
                                    <label className="text-sm font-medium text-gray-600">Capacity</label>
                                    <div className="col-span-2">
                                        <input type="number" step="1" className="w-full border border-gray-300 rounded-md p-1.5" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: parseFloat(e.target.value) })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center">
                                    <label className="text-sm font-medium text-gray-600">Time Efficiency</label>
                                    <div className="col-span-2 relative">
                                        <input type="number" step="1" className="w-full border border-gray-300 rounded-md p-1.5 pr-8" value={formData.time_efficiency} onChange={e => setFormData({ ...formData, time_efficiency: parseFloat(e.target.value) })} />
                                        <span className="absolute right-3 top-2 text-gray-500">%</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 items-center">
                                    <label className="text-sm font-medium text-gray-600">OEE Target</label>
                                    <div className="col-span-2 relative">
                                        <input type="number" step="1" className="w-full border border-gray-300 rounded-md p-1.5 pr-8" value={formData.oee_target} onChange={e => setFormData({ ...formData, oee_target: parseFloat(e.target.value) })} />
                                        <span className="absolute right-3 top-2 text-gray-500">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-[#714B67] text-white rounded hover:bg-[#5d3d54] text-sm font-medium shadow-sm transition-colors">Create Work Center</button>
                        </div>
                    </form>
                ) : selectedWC ? (
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-100">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">{selectedWC.name}</h1>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Factory size={16} />
                                    <span>{selectedWC.code}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-gray-900">{selectedWC.oee_target}%</div>
                                <div className="text-sm text-gray-500 uppercase tracking-wide font-medium">OEE Target</div>
                            </div>
                        </div>

                        {/* Form Fields (Read Only Prototype) */}
                        <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 items-center">
                                    <label className="text-sm font-medium text-gray-600">Code</label>
                                    <div className="col-span-2 text-sm text-gray-900 border-b border-gray-200 pb-1">{selectedWC.code}</div>
                                </div>
                                <div className="grid grid-cols-3 items-center">
                                    <label className="text-sm font-medium text-gray-600">Working Hours</label>
                                    <div className="col-span-2 text-sm text-gray-900 border-b border-gray-200 pb-1">Standard 40h/week</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-3 items-center">
                                    <label className="text-sm font-medium text-gray-600">Capacity</label>
                                    <div className="col-span-2 text-sm text-gray-900 border-b border-gray-200 pb-1">{selectedWC.capacity}</div>
                                </div>
                                <div className="grid grid-cols-3 items-center">
                                    <label className="text-sm font-medium text-gray-600">Time Efficiency</label>
                                    <div className="col-span-2 text-sm text-gray-900 border-b border-gray-200 pb-1">{selectedWC.time_efficiency}%</div>
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <Settings size={48} className="mb-4 opacity-20" />
                        <p className="text-lg">Select a work center</p>
                    </div>
                )}
            </div>
        </div>
    );
}
