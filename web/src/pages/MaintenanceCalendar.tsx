import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Wrench } from 'lucide-react';
import clsx from 'clsx';

interface MaintenanceRequest {
    id: number;
    subject: string;
    stage: string;
    maintenance_type: string;
    scheduled_date?: string;
    priority: string;
}

export default function MaintenanceCalendar() {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);

    useEffect(() => {
        fetchRequests();
    }, [currentDate]);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/requests/');
            // Filter for Preventive and valid date
            const preventive = res.data.filter((r: MaintenanceRequest) =>
                r.maintenance_type === 'Preventive' && r.scheduled_date
            );
            setRequests(preventive);
        } catch (err) {
            console.error("Failed to fetch requests", err);
        }
    };

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1).toISOString().split('T')[0];
        navigate(`/requests/new?date=${dateStr}&type=Preventive`);
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const blanks = Array.from({ length: firstDay }, (_, i) => (
            <div key={`blank-${i}`} className="bg-gray-50 border border-gray-100 h-32"></div>
        ));

        const days = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = new Date(year, month, day).toISOString().split('T')[0]; // Comparing YYYY-MM-DD

            // Find requests for this day
            const dayRequests = requests.filter(r => {
                if (!r.scheduled_date) return false;
                return r.scheduled_date.startsWith(dateStr);
            });

            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            return (
                <div
                    key={day}
                    className={clsx(
                        "h-32 border border-gray-200 bg-white p-2 relative group hover:bg-gray-50 transition-colors cursor-pointer",
                        isToday && "bg-blue-50"
                    )}
                    onClick={() => handleDateClick(day)}
                >
                    <span className={clsx(
                        "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full mb-1",
                        isToday ? "bg-blue-600 text-white" : "text-gray-700 group-hover:bg-gray-200"
                    )}>
                        {day}
                    </span>

                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100%-2rem)]">
                        {dayRequests.map(req => (
                            <div
                                key={req.id}
                                className={clsx(
                                    "text-xs p-1 rounded border truncate flex items-center gap-1",
                                    "bg-purple-100 border-purple-200 text-purple-800 hover:bg-purple-200"
                                )}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/requests/${req.id}`);
                                }}
                                title={req.subject}
                            >
                                <Wrench size={10} />
                                {req.subject}
                            </div>
                        ))}
                    </div>
                </div>
            );
        });

        return [...blanks, ...days];
    };

    return (
        <div className="h-full flex flex-col p-2">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <CalendarIcon className="text-blue-600" />
                        Preventive Schedule
                    </h1>
                    <div className="flex items-center bg-white border border-gray-300 rounded-md shadow-sm">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 border-r border-gray-300">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="px-4 py-2 font-medium min-w-[150px] text-center">
                            {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 border-l border-gray-300">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/requests/new?type=Preventive')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow-sm flex items-center gap-2"
                >
                    <CalendarIcon size={16} />
                    Schedule Maintenance
                </button>
            </div>

            <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="p-3 text-center font-semibold text-gray-500 text-sm">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 flex-1 overflow-y-auto">
                    {renderCalendar()}
                </div>
            </div>
        </div>
    );
}
