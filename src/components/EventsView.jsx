import React, { useState } from 'react';
import { Sparkles, Calendar, MapPin, Users, Check, ExternalLink, ArrowRight } from 'lucide-react';
import { CAMPUS_EVENTS } from '../data/mockData';
import confetti from 'canvas-confetti';

export default function EventsView({ onShowToast }) {
  const [events, setEvents] = useState(CAMPUS_EVENTS);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const CATEGORIES = ['All', 'Technical', 'Workshops', 'Sports', 'Placement'];

  const filtered = events.filter((e) =>
    activeCategory === 'All' ? true : e.category === activeCategory
  );

  const handleRegister = (id) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const nextRegistered = !e.registered;
          if (nextRegistered) {
            confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
            onShowToast?.(`Registered for ${e.title} ✓`, 'success');
          } else {
            onShowToast?.(`Registration cancelled for ${e.title}`, 'info');
          }
          return {
            ...e,
            registered: nextRegistered,
            attendeesCount: nextRegistered ? e.attendeesCount + 1 : e.attendeesCount - 1,
          };
        }
        return e;
      })
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div className="context-header">
        <div className="context-date">
          <Sparkles size={13} color="var(--brand-blue)" />
          <span>Campus Life & Innovation</span>
        </div>
        <h1 className="context-greeting">Campus Events</h1>
        <p className="context-subtext">
          Conferences, engineering workshops, sports meets, and industry recruitment seminars.
        </p>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Event Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {filtered.map((evt) => (
          <div key={evt.id} className="bezel-wrap" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="bezel-inner" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={evt.image}
                  alt={evt.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  className="badge badge-neutral"
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    color: '#FFFFFF',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  {evt.category}
                </span>
              </div>

              <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {evt.title}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {evt.description}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: 'auto',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.65rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={13} />
                    <span>{evt.date} · {evt.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={13} />
                    <span>{evt.venue}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Users size={13} />
                    <span>{evt.attendeesCount} Registered · {evt.organizer}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className={`btn btn-sm ${evt.registered ? 'btn-secondary' : 'btn-blue'}`}
                  onClick={() => handleRegister(evt.id)}
                  style={{ width: '100%', marginTop: '0.25rem' }}
                >
                  {evt.registered ? (
                    <>
                      <Check size={14} color="var(--state-success)" />
                      <span>Registered ✓</span>
                    </>
                  ) : (
                    <span>Register Now</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
