import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wrench, Settings, Hammer, ClipboardList, Factory, LogOut, Tag, Calendar } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const { user, logout } = useAuth();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Requests', path: '/requests', icon: ClipboardList },
        { name: 'Kanban', path: '/kanban', icon: Wrench },
        { name: 'Calendar', path: '/calendar', icon: Calendar },
        { name: 'Equipment', path: '/equipment', icon: Hammer },
        { name: 'Work Centers', path: '/work-centers', icon: Factory },

        { name: 'Teams', path: '/teams', icon: Settings },
        { name: 'Categories', path: '/categories', icon: Tag },
    ];

    return (
        <div className="layout-container flex flex-col h-screen">
            {/* Top Navbar */}
            <header className="bg-[#714B67] border-b border-[#714B67] h-16 flex items-center justify-between px-6 shrink-0 z-10 shadow-md">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <Wrench className="text-white" size={24} />
                        <span className="text-xl font-bold text-white tracking-wide">GearGuard</span>
                    </div>

                    <nav className="flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={clsx(
                                        'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-white/10 text-white shadow-sm'
                                            : 'text-white/70 hover:text-white hover:bg-white/5'
                                    )}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="user-profile flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-white">{user?.name || 'Guest'}</p>
                        <p className="text-xs text-white/70">{user?.role || 'Visitor'}</p>
                    </div>
                    <button onClick={logout} className="text-white/70 hover:text-white px-2 transition-colors" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-hidden bg-gray-50 p-6">
                <div className="h-full overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
