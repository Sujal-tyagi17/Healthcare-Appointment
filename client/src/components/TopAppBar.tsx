import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

interface TopAppBarProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  title?: string;
  onOpenAIInsights?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'appointment' | 'medication' | 'system' | 'ai';
  read: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  searchQuery = '',
  onSearchChange,
  title = 'CarePulse',
  onOpenAIInsights
}) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Role-tailored initial notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    if (user?.role === 'DOCTOR') {
      return [
        {
          id: '1',
          title: 'AI Pre-Visit Triage Ready',
          message: 'Patient Rahul Sharma chief complaint synthesized with 3 diagnostic questions.',
          time: '5m ago',
          type: 'ai',
          read: false
        },
        {
          id: '2',
          title: 'Appointment Booked',
          message: 'Confirmed slot for 11:00 AM today (Room 102).',
          time: '25m ago',
          type: 'appointment',
          read: false
        },
        {
          id: '3',
          title: 'Google Calendar Synced',
          message: 'Real-time two-way synchronization active for today’s schedule.',
          time: '1h ago',
          type: 'system',
          read: true
        }
      ];
    } else if (user?.role === 'ADMIN') {
      return [
        {
          id: '1',
          title: 'Audit Trail Telemetry',
          message: 'New outbound booking confirmation dispatched successfully.',
          time: '2m ago',
          type: 'system',
          read: false
        },
        {
          id: '2',
          title: 'Anti-Collision Hold Engine',
          message: '10-Minute slot mutex lock successfully resolved.',
          time: '18m ago',
          type: 'appointment',
          read: false
        },
        {
          id: '3',
          title: 'Automated Cron Worker',
          message: 'Prescription adherence verification cycle executed normally.',
          time: '45m ago',
          type: 'system',
          read: true
        }
      ];
    } else {
      return [
        {
          id: '1',
          title: 'Prescription Medication Alarm',
          message: 'Scheduled reminder for Metoprolol 25mg (Twice daily).',
          time: '10m ago',
          type: 'medication',
          read: false
        },
        {
          id: '2',
          title: 'Appointment Confirmed',
          message: 'Your consultation with Dr. Amit Verma is confirmed with Google Calendar link.',
          time: '30m ago',
          type: 'appointment',
          read: false
        },
        {
          id: '3',
          title: 'AI Symptom Assessment',
          message: 'Your intake was stratified as LOW URGENCY. Doctor has been briefed.',
          time: '1h ago',
          type: 'ai',
          read: true
        }
      ];
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'appointment':
        return <span className="material-symbols-outlined text-primary text-base">calendar_month</span>;
      case 'medication':
        return <span className="material-symbols-outlined text-tertiary text-base">alarm_on</span>;
      case 'ai':
        return <span className="material-symbols-outlined text-secondary text-base">psychiatry</span>;
      default:
        return <span className="material-symbols-outlined text-on-surface-variant text-base">info</span>;
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 flex justify-between items-center px-6 h-16 z-30 bg-surface/90 backdrop-blur-xl border-b border-outline-variant shadow-md">
      {/* Search Input on Left */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md hidden sm:block focus-within:ring-2 focus-within:ring-primary/50 transition-all rounded-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search patients, records, doctors..."
            className="w-full bg-surface-container border border-outline-variant rounded-full py-1.5 pl-10 pr-4 text-xs text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:bg-surface-container-high transition-all font-medium"
          />
        </div>
        <span className="font-heading font-extrabold text-sm text-on-surface sm:hidden">{title}</span>
      </div>

      {/* Trailing Icon Actions & User Profile */}
      <div className="flex items-center gap-2 relative" ref={dropdownRef}>
        {/* Notification Bell Button */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all relative ${
            showNotifications
              ? 'bg-primary/20 text-primary ring-2 ring-primary/40'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          }`}
          title="Notifications"
          aria-expanded={showNotifications}
        >
          <span className="material-symbols-outlined text-lg">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-surface animate-pulse" />
          )}
        </button>

        {/* Notifications Dropdown Panel */}
        {showNotifications && (
          <div className="absolute right-0 top-13 w-80 sm:w-96 bg-[#0b1328] border border-cyan-500/25 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden z-50 animate-fade-in backdrop-blur-3xl ring-1 ring-white/10">
            {/* Dropdown Header */}
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-[#0f1b38]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                  <span className="material-symbols-outlined text-sm">notifications_active</span>
                </div>
                <span className="font-heading font-extrabold text-xs text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/25 text-primary text-[10px] font-extrabold font-mono border border-primary/40">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-primary hover:text-cyan-300 font-heading font-bold transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-white/5 bg-[#0b1328]">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-on-surface-variant space-y-2">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant/40">notifications_off</span>
                  <p className="text-xs font-medium">All caught up! No notifications.</p>
                </div>
              ) : (
                notifications.map(item => (
                  <div
                    key={item.id}
                    className={`p-3.5 transition-colors flex items-start gap-3 relative group ${
                      item.read
                        ? 'bg-[#0b1328] hover:bg-[#111e3b]'
                        : 'bg-[#101d3a] hover:bg-[#15254a] border-l-2 border-primary'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#142347] flex items-center justify-center shrink-0 border border-white/10 shadow-sm">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs font-heading font-bold truncate ${item.read ? 'text-slate-200' : 'text-white'}`}>
                          {item.title}
                        </p>
                        <span className="text-[10px] text-cyan-400/80 font-mono shrink-0 font-medium">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {item.message}
                      </p>
                    </div>

                    {/* Delete action button on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(item.id);
                      }}
                      className="absolute right-2 top-2 p-1 text-slate-500 hover:text-red-400 rounded transition-opacity opacity-0 group-hover:opacity-100"
                      title="Dismiss notification"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 border-t border-white/10 bg-[#080e1c] text-center">
              <span className="text-[10px] font-medium text-slate-400">CarePulse Real-Time Clinical Notifications</span>
            </div>
          </div>
        )}

        {/* AI Assistant Button */}
        <button
          onClick={onOpenAIInsights}
          className="w-9 h-9 rounded-full flex items-center justify-center text-secondary hover:text-primary hover:bg-surface-container-high transition-all"
          title="AI Assistant"
        >
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2.5 ml-2 pl-2 border-l border-outline-variant">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-heading font-extrabold text-xs shadow-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-on-surface font-heading leading-tight truncate max-w-[120px]">{user?.name}</p>
            <p className="text-[10px] text-on-surface-variant capitalize font-medium">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
