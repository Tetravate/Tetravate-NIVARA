import React, { useState } from 'react';
import { Bell, Check, X, ArrowRight, Trash2 } from 'lucide-react';
import { useNivara } from '../context/NivaraContext';

export default function NotificationsDrawer() {
  const {
    currentRole,
    notificationsOpen,
    setNotificationsOpen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    setActiveTab,
  } = useNivara();

  const [filterMode, setFilterMode] = useState('all'); // all | unread

  React.useEffect(() => {
    if (!notificationsOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setNotificationsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notificationsOpen, setNotificationsOpen]);

  if (!notificationsOpen) return null;

  // Filter role-relevant notifications (or all if admin)
  const roleNotifications = notifications.filter(
    (n) => n.recipientRole === currentRole || n.recipientRole === 'all' || currentRole === 'admin'
  );

  const displayedNotifications = roleNotifications.filter((n) => {
    if (filterMode === 'unread') return n.unread;
    return true;
  });

  const unreadCount = roleNotifications.filter((n) => n.unread).length;

  const handleNotificationClick = (item) => {
    markNotificationRead(item.id);
    if (item.actionTab) {
      setActiveTab(item.actionTab);
      setNotificationsOpen(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => setNotificationsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Notifications Drawer"
    >
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} color="var(--brand-blue)" />
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Notifications
              </h2>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {unreadCount} unread update{unreadCount === 1 ? '' : 's'} for {currentRole}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={markAllNotificationsRead}
              >
                <Check size={12} /> Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={() => setNotificationsOpen(false)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '4px', minHeight: '32px' }}
              aria-label="Close notifications"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.35rem', padding: '0.75rem 1.5rem 0.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            className={`btn btn-sm ${filterMode === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterMode('all')}
            style={{ minHeight: '26px', fontSize: '0.6875rem' }}
          >
            All Updates ({roleNotifications.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterMode === 'unread' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterMode('unread')}
            style={{ minHeight: '26px', fontSize: '0.6875rem' }}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* List of Notifications */}
        <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '65vh', overflowY: 'auto' }}>
          {displayedNotifications.length === 0 ? (
            <div className="empty-state">
              <Bell size={32} color="var(--border-strong)" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {filterMode === 'unread' ? 'No unread notifications' : 'No notifications found'}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {filterMode === 'unread'
                  ? 'You are all caught up across your academic updates.'
                  : 'Notifications generated from courses, dues, and requests will appear here.'}
              </div>
            </div>
          ) : (
            displayedNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: item.unread ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                  border: '1px solid',
                  borderColor: item.unread ? 'var(--border-strong)' : 'var(--border-subtle)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {item.unread && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: item.tier === 'urgent' ? 'var(--state-urgent)' : 'var(--brand-blue)',
                    }}
                  />
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: item.unread ? 700 : 600, color: 'var(--text-primary)' }}>
                    {item.title}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissNotification(item.id);
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '2px', minHeight: '22px', color: 'var(--text-muted)' }}
                    title="Dismiss notification"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.45rem', lineHeight: 1.4 }}>
                  {item.message}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  <span>{item.timeAgo}</span>
                  {item.actionTab && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--brand-blue)', fontWeight: 600 }}>
                      Open view <ArrowRight size={11} />
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
