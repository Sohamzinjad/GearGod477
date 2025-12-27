import { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Users, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    team_id?: number | null;
}

interface Team {
    id: number;
    name: string;
}

export default function TeamsPage() {
    const { user } = useAuth();
    const [teams, setTeams] = useState<Team[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    // UI State
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [showCreateTeam, setShowCreateTeam] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');

    // Assignment State
    const [showAssign, setShowAssign] = useState(false);
    const [userToAssign, setUserToAssign] = useState('');

    useEffect(() => {
        fetchTeams();
        fetchUsers();
    }, []);

    const fetchTeams = () => api.get('/teams/').then(res => setTeams(res.data));
    const fetchUsers = () => api.get('/auth/members').then(res => setUsers(res.data));

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/teams/', { name: newTeamName });
            setNewTeamName('');
            setShowCreateTeam(false);
            fetchTeams();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAssignUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeam || !userToAssign) return;
        try {
            await api.post(`/teams/${selectedTeam.id}/assign/${userToAssign}`);
            setShowAssign(false);
            setUserToAssign('');
            fetchUsers(); // Refresh users to update their team_id locally if we were showing it
            // Ideally we also refresh the team members list if we filtered by team
        } catch (err) {
            console.error(err);
        }
    };

    const getTeamMembers = (teamId: number) => users.filter(u => u.team_id === teamId);

    return (
        <div className="teams-page flex h-full gap-6">
            {/* Team List */}
            <div className="w-1/3 bg-white border border-gray-200 rounded-lg flex flex-col h-full">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Teams</h2>
                        <button
                            onClick={() => setShowCreateTeam(true)}
                            className="btn btn-primary flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
                        >
                            <Plus size={16} /> New Team
                        </button>
                    </div>
                </div>

                {showCreateTeam && (
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <form onSubmit={handleCreateTeam} className="flex gap-2">
                            <input
                                className="flex-1 border border-gray-300 rounded-md p-1.5 text-sm"
                                placeholder="Team Name"
                                value={newTeamName}
                                onChange={e => setNewTeamName(e.target.value)}
                            />
                            <button type="submit" className="text-xs bg-green-600 text-white px-2 rounded">Save</button>
                            <button type="button" onClick={() => setShowCreateTeam(false)} className="text-xs text-gray-500">Cancel</button>
                        </form>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    {teams.map(team => (
                        <div
                            key={team.id}
                            onClick={() => setSelectedTeam(team)}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedTeam?.id === team.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium text-gray-900">{team.name}</h3>
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                    {getTeamMembers(team.id).length} members
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Team Members / Details */}
            <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6 overflow-y-auto">
                {selectedTeam ? (
                    <div>
                        <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{selectedTeam.name}</h1>
                                <p className="text-gray-500 text-sm">Manage team members and assignments</p>
                            </div>
                            <button
                                onClick={() => setShowAssign(true)}
                                className="flex items-center gap-2 text-sm bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-50"
                            >
                                <UserPlus size={16} /> Assign User
                            </button>
                        </div>

                        {showAssign && (
                            <form onSubmit={handleAssignUser} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select User to Assign</label>
                                <div className="flex gap-2">
                                    <select
                                        className="flex-1 border border-gray-300 rounded-md p-2"
                                        value={userToAssign}
                                        onChange={e => setUserToAssign(e.target.value)}
                                    >
                                        <option value="">Select a user...</option>
                                        {users.filter(u => u.team_id !== selectedTeam.id).map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                        ))}
                                    </select>
                                    <button type="submit" className="bg-blue-600 text-white px-4 rounded-md">Assign</button>
                                    <button type="button" onClick={() => setShowAssign(false)} className="text-gray-500 px-4">Cancel</button>
                                </div>
                            </form>
                        )}

                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Users size={18} /> Team Members
                        </h3>

                        <div className="space-y-2">
                            {getTeamMembers(selectedTeam.id).length === 0 ? (
                                <p className="text-gray-400 italic">No members assigned.</p>
                            ) : (
                                getTeamMembers(selectedTeam.id).map(member => (
                                    <div key={member.id} className="p-3 border border-gray-100 rounded-lg flex justify-between items-center hover:bg-gray-50">
                                        <div>
                                            <p className="font-medium text-gray-900">{member.name}</p>
                                            <p className="text-sm text-gray-500">{member.email}</p>
                                        </div>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase font-bold">
                                            {member.role}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <Users size={48} className="mb-4 opacity-20" />
                        <p className="text-lg">Select a team to view members</p>
                    </div>
                )}
            </div>
        </div>
    );
}
