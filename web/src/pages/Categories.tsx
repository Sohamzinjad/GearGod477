import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Search, Tag } from 'lucide-react';


interface User { id: number; name: string; }

interface Category {
    id: number;
    name: string;
    responsible_id?: number;
    company_name?: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [showCreate, setShowCreate] = useState(false);

    // Form State
    const [newCategoryName, setNewCategoryName] = useState('');
    const [responsibleId, setResponsibleId] = useState('');
    const [companyName, setCompanyName] = useState('My Company (San Francisco)');

    useEffect(() => {
        fetchCategories();
        fetchUsers();
    }, []);

    const fetchCategories = () => {
        api.get('/categories/')
            .then(res => setCategories(res.data))
            .catch(err => console.error(err));
    };

    const fetchUsers = () => {
        api.get('/auth/members')
            .then(res => setUsers(res.data))
            .catch(err => console.error(err));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/categories/', {
                name: newCategoryName,
                responsible_id: responsibleId ? parseInt(responsibleId) : null,
                company_name: companyName
            });
            fetchCategories();
            setShowCreate(false);
            setNewCategoryName('');
            setResponsibleId('');
            setCompanyName('My Company (San Francisco)');
        } catch (err) {
            console.error("Failed to create category", err);
        }
    };

    // Helper to get user name
    const getUserName = (id?: number) => users.find(u => u.id === id)?.name || 'Mitchell Admin'; // Fallback for display if ID missing

    return (
        <div className="h-full flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Categories</h2>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-1 text-sm bg-[#714B67] text-white px-4 py-1.5 rounded hover:bg-[#5d3d54] shadow-sm transition-colors"
                    >
                        <Plus size={16} /> New
                    </button>
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
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Responsible</th>
                            <th className="px-6 py-3">Company</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {categories.map(cat => (
                            <tr key={cat.id} className="hover:bg-gray-50">
                                <td className="px-6 py-3 font-medium text-gray-900 flex items-center gap-2">
                                    <Tag size={16} className="text-gray-400" />
                                    {cat.name}
                                </td>
                                <td className="px-6 py-3 text-gray-600">{getUserName(cat.responsible_id)}</td>
                                <td className="px-6 py-3 text-gray-600">{cat.company_name || 'My Company (San Francisco)'}</td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                    No categories found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal for Creation */}
            {showCreate && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96 transform transition-all scale-100">
                        <h3 className="text-lg font-bold mb-4">Create Category</h3>
                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                <input
                                    autoFocus
                                    className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#714B67] focus:border-[#714B67] outline-none"
                                    value={newCategoryName}
                                    onChange={e => setNewCategoryName(e.target.value)}
                                    placeholder="e.g. Computers"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Responsible</label>
                                <select
                                    className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#714B67] focus:border-[#714B67] outline-none bg-white"
                                    value={responsibleId}
                                    onChange={e => setResponsibleId(e.target.value)}
                                >
                                    <option value="">Select User...</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                <input
                                    className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#714B67] focus:border-[#714B67] outline-none"
                                    value={companyName}
                                    onChange={e => setCompanyName(e.target.value)}
                                    placeholder="Company Name"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newCategoryName.trim()}
                                    className={`px-4 py-2 bg-[#714B67] text-white rounded hover:bg-[#5d3d54] transition-colors ${!newCategoryName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
