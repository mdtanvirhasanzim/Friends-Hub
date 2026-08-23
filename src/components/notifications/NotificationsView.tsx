import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Heart,
  MessageCircle,
  Calendar,
  Image as ImageIcon,
  UserPlus,
  Radio,
  Trash2,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { timeAgo } from '../../lib/geoUtils';

interface NotificationsViewProps {
  onNavigateTab: (tab: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onNavigateTab }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-teal-400" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'photo':
        return <ImageIcon className="w-4 h-4 text-emerald-400" />;
      case 'member_joined':
        return <UserPlus className="w-4 h-4 text-amber-400" />;
      case 'location_alert':
        return <Radio className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const displayed = notifications.filter((n) => (filterUnreadOnly ? !n.is_read : true));

  return (
    <div id="notifications-view" className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Notifications</h2>
            {unreadCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time activity alerts from your squad.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterUnreadOnly
                ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {filterUnreadOnly ? 'Unread Only' : 'All'}
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {displayed.length === 0 ? (
          <div className="p-16 text-center bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-400 text-sm">
            <Bell className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-slate-300">All caught up!</p>
            <p className="text-xs text-slate-500 mt-1">No new notifications to show.</p>
          </div>
        ) : (
          displayed.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                markAsRead(item.id);
                if (item.link_tab) onNavigateTab(item.link_tab);
              }}
              className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center justify-between gap-4 ${
                item.is_read
                  ? 'bg-slate-900/70 border-slate-800/80 text-slate-300'
                  : 'bg-emerald-950/20 border-emerald-500/40 text-white shadow-md'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700/60">
                  {getIcon(item.type)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-100">{item.title}</h4>
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{item.message}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-500">{timeAgo(item.created_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
