import { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Equipment {
    id: number;
    name: string;
    serial_number: string;
    status: string;
    category_id?: number;
    team_id?: number;
    employee_id?: string;
}

interface Category { id: number; name: string; }
interface Team { id: number; name: string; }

interface User { id: number; name: string; }

export default function EquipmentPage() {
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEquipments();
        fetchDropdowns();
    }, []);

    const fetchEquipments = () => {
        api.get('/equipments/')
            .then(res => setEquipments(res.data))
            .catch(err => console.error(err));
    };

    const fetchDropdowns = async () => {
        try {
            const [cats, usrs] = await Promise.all([
                api.get('/categories/'),
                api.get('/auth/members')
            ]);
            setCategories(cats.data);
            setUsers(usrs.data);
        } catch (e) {
            console.error("Failed to fetch dropdowns", e);
        }
    }

    const getCategoryName = (id?: number) => categories.find(c => c.id === id)?.name || '-';
    const getUserName = (id?: string | number) => {
        if (!id) return '-';
        return users.find(u => u.id === parseInt(String(id)))?.name || '-';
    };

    return (
        <div className="equipment-page h-full flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Equipment</h2>
                    <button
                        onClick={() => navigate('/equipment/new')}
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
                            <th className="px-6 py-3">Equipment Name</th>
                            <th className="px-6 py-3">Employee</th>
                            <th className="px-6 py-3">Serial Number</th>
                            <th className="px-6 py-3">Technician</th>
                            <th className="px-6 py-3">Equipment Category</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Company</th>
                        </tr>
                    </thead>
                    <tbody className="options-y divide-gray-100">
                        {equipments.map(eq => (
                            <tr
                                key={eq.id}
                                onClick={() => navigate(`/equipment/${eq.id}`)}
                                className="hover:bg-blue-50 cursor-pointer transition-colors"
                            >
                                <td className="px-6 py-3 font-medium text-gray-900">{eq.name}</td>
                                <td className="px-6 py-3 text-gray-600">{getUserName(eq.employee_id)}</td>
                                <td className="px-6 py-3 text-gray-600">{eq.serial_number}</td>
                                <td className="px-6 py-3 text-gray-600">Mitchell Admin</td>
                                <td className="px-6 py-3 text-gray-600">{getCategoryName(eq.category_id)}</td>
                                <td className="px-6 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${eq.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {eq.status}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-gray-600">My Company (San Francisco)</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

