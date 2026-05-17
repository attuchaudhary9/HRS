import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { HotelGrid } from '../components/HotelGrid';
import type { RoomData } from '../components/HotelGrid';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [expandedBookings, setExpandedBookings] = useState<number[]>([]);
  const [stats, setStats] = useState<any>(null);
  
  const [selectedRoomIds, setSelectedRoomIds] = useState<number[]>([]);
  const [numRooms, setNumRooms] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchData();
    }
  }, [user]);

  const fetchData = () => {
    fetchRooms();
    fetchMyBookings();
    if (user?.role === 'ADMIN') {
      fetchStats();
    }
  };

  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/rooms');
      setRooms(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const { data } = await api.get('/bookings');
      setMyBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/bookings', { numRooms });
      showMessage('Booking successful!', 'success');
      setSelectedRoomIds(data.bookedRooms.map((r: any) => r.id));
      fetchData();
    } catch (err: any) {
      showMessage(err.response?.data?.message || 'Booking failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      await api.delete(`/bookings/${bookingId}`);
      showMessage('Booking cancelled', 'success');
      fetchData();
    } catch (err: any) {
      showMessage('Failed to cancel', 'error');
    }
  };

  const handleRandomize = async () => {
    try {
      await api.post('/admin/randomize');
      setSelectedRoomIds([]);
      fetchData();
      showMessage('Occupancy randomized', 'success');
    } catch (err: any) {
      showMessage('Failed to randomize', 'error');
    }
  };

  const handleReset = async () => {
    try {
      await api.post('/admin/reset');
      setSelectedRoomIds([]);
      fetchData();
      showMessage('All bookings reset', 'success');
    } catch (err: any) {
      showMessage('Failed to reset', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <>
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 20 }}>
            H
          </div>
          <h1 style={{ fontSize: '1.2rem' }}>Grand Royale</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>{user.email} <strong style={{ color: 'var(--primary)', marginLeft: 8 }}>{user.role}</strong></span>
          <button className="btn" style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)' }} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="main-content" style={{ flexDirection: 'column', gap: '24px' }}>
        {user.role === 'ADMIN' && (
          <div className="admin-panel glass-panel" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <h2 style={{ color: 'var(--danger)', margin: 0 }}>Admin Dashboard</h2>
              {stats && (
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.occupancyRate}%</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Occupancy</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalBookings}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Bookings</div>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn" onClick={handleRandomize} style={{ background: 'rgba(255,255,255,0.1)' }}>
                Randomize Occupancy
              </button>
              <button className="btn btn-danger" onClick={handleReset}>
                Reset Entire Booking
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '2%', width: '100%', alignItems: 'flex-start' }}>
          <div className="sidebar" style={{ width: '25%', flexShrink: 0 }}>
            <div className="booking-panel glass-panel">
              <h2 style={{ marginBottom: '16px' }}>Book Rooms</h2>
              <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="label-text">Number of Rooms (1-5)</label>
                  <input 
                    type="number" 
                    className="input-field"
                    min="1" max="5" 
                    value={numRooms}
                    onChange={e => setNumRooms(parseInt(e.target.value))}
                    required
                  />
                </div>
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? 'Booking...' : 'Book Optimal Rooms'}
                </button>
              </form>
            </div>

            {myBookings.length > 0 && (
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', maxHeight: '400px' }}>
                <h2 style={{ marginBottom: '16px', flexShrink: 0 }}>My Bookings</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '8px' }}>
                  {myBookings.map(b => {
                    const roomList = b.Rooms || [];
                    const isExpanded = expandedBookings.includes(b.id);
                    const displayRooms = isExpanded ? roomList.map((r: any) => `Rm ${r.number}`).join(', ') : roomList.slice(0, 5).map((r: any) => `Rm ${r.number}`).join(', ');
                    const remainingCount = roomList.length - 5;
                    
                    const toggleExpand = () => {
                      setExpandedBookings(prev => prev.includes(b.id) ? prev.filter(id => id !== b.id) : [...prev, b.id]);
                    };
                    
                    return (
                      <div key={b.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ paddingRight: '12px' }}>
                          <div style={{ fontWeight: 600, marginBottom: '4px' }}>Booking #{b.id}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                            {displayRooms}
                            {remainingCount > 0 && (
                              <button 
                                onClick={toggleExpand}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, marginLeft: '4px', textDecoration: 'underline', font: 'inherit', fontSize: '0.85rem' }}
                              >
                                {isExpanded ? 'See less' : `...and ${remainingCount} more`}
                              </button>
                            )}
                          </div>
                        </div>
                        <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.85rem', flexShrink: 0 }} onClick={() => handleCancelBooking(b.id)}>
                          Cancel
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          <div style={{ width: '73%', flexShrink: 0 }}>
            <HotelGrid rooms={rooms} selectedRoomIds={selectedRoomIds} />
          </div>
        </div>
      </div>

      {message && (
        <div className="notification" style={{ borderLeft: `4px solid var(--${message.type === 'success' ? 'success' : 'danger'})` }}>
          {message.type === 'success' ? <CheckCircle2 color="var(--success)" size={20} /> : <AlertCircle color="var(--danger)" size={20} />}
          <span>{message.text}</span>
        </div>
      )}
    </>
  );
};
