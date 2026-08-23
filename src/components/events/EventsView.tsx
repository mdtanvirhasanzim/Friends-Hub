import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Users,
  Check,
  HelpCircle,
  X,
  ExternalLink,
  Share2,
  Download,
  Sparkles,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../lib/storage';
import { CommunityEvent, RSVPStatus } from '../../types';
import confetti from 'canvas-confetti';

interface EventsViewProps {
  onOpenEventOnMap?: (eventId: string, coords: { lat: number; lng: number }) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({ onOpenEventOnMap }) => {
  const { currentUser, isAdmin } = useAuth();

  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState('23.7461');
  const [longitude, setLongitude] = useState('90.3742');

  useEffect(() => {
    setEvents(store.getEvents());
    const unsub = store.subscribe(() => setEvents(store.getEvents()));
    return () => unsub();
  }, []);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time || !locationName || !currentUser) return;

    store.createEvent({
      title,
      description,
      date,
      time,
      location_name: locationName,
      latitude: parseFloat(latitude) || 23.7461,
      longitude: parseFloat(longitude) || 90.3742,
      created_by: currentUser.id,
    });

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.7 },
    });

    setShowCreateModal(false);
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setLocationName('');
  };

  const handleRSVP = (eventId: string, status: RSVPStatus) => {
    if (!currentUser) return;
    store.setEventRSVP(eventId, currentUser.id, status);

    if (status === 'going') {
      confetti({
        particleCount: 20,
        spread: 50,
        origin: { y: 0.75 },
      });
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to cancel this meetup event?')) {
      store.deleteEvent(eventId);
    }
  };

  const handleExportICS = (evt: CommunityEvent) => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//FriendsHub//Event//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${evt.title}`,
      `DESCRIPTION:${evt.description}`,
      `LOCATION:${evt.location_name}`,
      `DTSTART:${evt.date.replace(/-/g, '')}T180000Z`,
      `DTEND:${evt.date.replace(/-/g, '')}T210000Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${evt.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="events-view" className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#080808] p-6 rounded-3xl border border-[#1a1a1a] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Meetups & Events</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-medium border border-white/5">
              {events.length} Upcoming
            </span>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Coordinate squad hangouts, road trips, dinners & celebrations.
          </p>
        </div>

        <button
          id="create-event-btn"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Plan New Meetup</span>
        </button>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {events.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-[#080808] rounded-3xl border border-[#1a1a1a] text-zinc-400">
            No upcoming events right now. Plan a coffee hangout or roadtrip!
          </div>
        ) : (
          events.map((evt) => {
            const creator = evt.creator || store.getProfile(evt.created_by);
            const myAttendance = currentUser
              ? evt.attendees?.find((a) => a.user_id === currentUser.id)?.status
              : null;
            const goingCount = evt.attendees?.filter((a) => a.status === 'going').length || 0;
            const maybeCount = evt.attendees?.filter((a) => a.status === 'maybe').length || 0;
            const canManage = currentUser?.id === evt.created_by || isAdmin;

            return (
              <div
                key={evt.id}
                className="p-6 rounded-3xl bg-[#080808] border border-[#1a1a1a] shadow-xl flex flex-col justify-between hover:border-white/20 transition-all group"
              >
                <div>
                  {/* Top tag & menu */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Community Hangout
                    </span>
                    {canManage && (
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="text-zinc-500 hover:text-rose-400 text-xs transition-colors p-1"
                        title="Cancel event"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-serif font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed mb-4">{evt.description}</p>

                  {/* Details Card */}
                  <div className="p-3.5 rounded-2xl bg-[#111111] border border-white/5 space-y-2.5 text-xs text-zinc-300 mb-4">
                    <div className="flex items-center gap-2 text-zinc-200">
                      <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="font-medium">{evt.date}</span>
                      <span className="text-zinc-500">•</span>
                      <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{evt.time}</span>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-300">
                      <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="truncate">{evt.location_name}</span>
                    </div>
                  </div>

                  {/* Attendees Faces */}
                  <div className="flex items-center justify-between mb-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 overflow-hidden">
                        {(evt.attendees || [])
                          .filter((a) => a.status === 'going')
                          .slice(0, 5)
                          .map((att) => {
                            const p = att.profile || store.getProfile(att.user_id);
                            return (
                              <img
                                key={att.id}
                                src={
                                  p?.avatar_url ||
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
                                }
                                alt={p?.full_name || 'Attendee'}
                                title={p?.full_name}
                                className="inline-block h-7 w-7 rounded-full ring-2 ring-black object-cover"
                              />
                            );
                          })}
                      </div>
                      <span className="text-zinc-300 font-medium">
                        {goingCount} Going {maybeCount > 0 && `• ${maybeCount} Maybe`}
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-500">
                      by {creator?.full_name?.split(' ')[0] || 'Friend'}
                    </div>
                  </div>
                </div>

                {/* RSVP Selector Buttons */}
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleRSVP(evt.id, 'going')}
                      className={`py-2 px-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                        myAttendance === 'going'
                          ? 'bg-zinc-800 text-white border border-white/20 shadow-sm'
                          : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-white/5'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Going</span>
                    </button>

                    <button
                      onClick={() => handleRSVP(evt.id, 'maybe')}
                      className={`py-2 px-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                        myAttendance === 'maybe'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-white/5'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Maybe</span>
                    </button>

                    <button
                      onClick={() => handleRSVP(evt.id, 'not_going')}
                      className={`py-2 px-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                        myAttendance === 'not_going'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-white/5'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </div>

                  {/* Secondary Actions: Map View & Calendar Export */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    {onOpenEventOnMap && evt.latitude && evt.longitude ? (
                      <button
                        onClick={() =>
                          onOpenEventOnMap(evt.id, {
                            lat: evt.latitude!,
                            lng: evt.longitude!,
                          })
                        }
                        className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>View on Live Map</span>
                      </button>
                    ) : (
                      <span />
                    )}

                    <button
                      onClick={() => handleExportICS(evt)}
                      className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
                      title="Add to Google / Apple Calendar"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Add to Calendar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-base text-white">Create Meetup / Hangout Event</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. FRIDAY NIGHT MEETUP"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is the plan? Dinner, board games, location details..."
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Time</label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 8:00 PM"
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Location Name</label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Dhanmondi Lake View Lounge"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Map Latitude (GPS)
                  </label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="23.7461"
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Map Longitude (GPS)
                  </label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="90.3742"
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20"
                >
                  Publish Meetup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
