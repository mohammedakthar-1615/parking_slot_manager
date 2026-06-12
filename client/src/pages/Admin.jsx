import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import API from '../api/axios';

export default function Admin() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [newSlot, setNewSlot] = useState({ slot_number: '', floor: 'G' });
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('slots');
  const [loading, setLoading] = useState(false);

  const fetchSlots = async () => {
    const res = await API.get('/slots');
    setSlots(res.data);
  };

  const fetchBookings = async () => {
    const res = await API.get('/bookings');
    setBookings(res.data);
  };

  const fetchComplaints = async () => {
    const res = await API.get('/complaints');
    setComplaints(res.data);
  };

  useEffect(() => {
    fetchSlots();
    fetchBookings();
    fetchComplaints();
  }, []);

  const handleAddSlot = async () => {
    if (!newSlot.slot_number) return;
    setLoading(true);
    try {
      await API.post('/slots', newSlot);
      setMessage('✅ Slot added successfully!');
      setNewSlot({ slot_number: '', floor: 'G' });
      fetchSlots();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Failed to add slot'));
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!confirm('Delete this slot?')) return;
    try {
      await API.delete(`/slots/${id}`);
      setMessage('✅ Slot deleted!');
      fetchSlots();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Failed to delete'));
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleResolve = async (id) => {
    try {
      await API.put(`/complaints/${id}/resolve`);
      setMessage('✅ Complaint resolved!');
      fetchComplaints();
    } catch (err) {
      setMessage('❌ Failed to resolve');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const available = slots.filter(s => s.status === 'available').length;
  const occupied = slots.filter(s => s.status === 'occupied').length;
  const activeBookings = bookings.filter(b => b.status === 'active').length;
  const pendingComplaints = complaints.filter(c => c.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-sm text-gray-500 mt-1">Manage parking slots and monitor bookings</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-gray-800">{slots.length}</div>
            <div className="text-sm text-gray-500 mt-1">Total Slots</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-green-600">{available}</div>
            <div className="text-sm text-gray-500 mt-1">Available</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-red-500">{occupied}</div>
            <div className="text-sm text-gray-500 mt-1">Occupied</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-blue-600">{activeBookings}</div>
            <div className="text-sm text-gray-500 mt-1">Active Bookings</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-purple-600">
              ₹{bookings
                .filter(b => b.status === 'completed' && b.amount > 0)
                .reduce((sum, b) => sum + Number(b.amount), 0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Total Revenue</div>
          </div>
        </div>

        <Toast message={message} />

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['slots', 'bookings', 'complaints'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition capitalize relative ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab === 'slots' ? '🅿️ Slots'
                : tab === 'bookings' ? '📋 Bookings'
                : (
                  <span className="flex items-center gap-2">
                    🚨 Complaints
                    {pendingComplaints > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {pendingComplaints}
                      </span>
                    )}
                  </span>
                )}
            </button>
          ))}
        </div>

        {/* ── Slots Tab ── */}
        {activeTab === 'slots' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4">Add New Slot</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Slot Number (e.g. G11)"
                  value={newSlot.slot_number}
                  onChange={e => setNewSlot({ ...newSlot, slot_number: e.target.value.toUpperCase() })}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newSlot.floor}
                  onChange={e => setNewSlot({ ...newSlot, floor: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="G">Ground Floor</option>
                  <option value="F1">Floor 1</option>
                  <option value="F2">Floor 2</option>
                </select>
                <button
                  onClick={handleAddSlot}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
                >
                  {loading ? 'Adding...' : '+ Add Slot'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4">All Slots</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {slots.map(slot => (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      slot.status === 'occupied'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-800">{slot.slot_number}</p>
                      <p className="text-xs text-gray-500">Floor {slot.floor}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        slot.status === 'occupied'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {slot.status}
                      </span>
                      {slot.status === 'available' && (
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Bookings Tab ── */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4">All Bookings</h2>
            {bookings.length === 0 ? (
              <p className="text-sm text-gray-400">No bookings yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">User</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">Slot</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">Vehicle</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">Check In</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">Check Out</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <p className="font-medium text-gray-800">{b.user_name}</p>
                          <p className="text-xs text-gray-400">{b.email}</p>
                        </td>
                        <td className="py-3 px-2 font-medium">{b.slot_number}</td>
                        <td className="py-3 px-2">{b.vehicle_number}</td>
                        <td className="py-3 px-2 text-gray-500">
                          {new Date(b.check_in).toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-gray-500">
                          {b.check_out ? new Date(b.check_out).toLocaleString() : '—'}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            b.status === 'active'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          {b.status === 'active' ? (
                            <span className="text-xs text-gray-400">Pending</span>
                          ) : b.amount == 0 ? (
                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                              FREE
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                              ₹{b.amount}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Complaints Tab ── */}
        {activeTab === 'complaints' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">All Complaints</h2>
              {pendingComplaints > 0 && (
                <span className="text-xs bg-red-100 text-red-600 font-medium px-3 py-1 rounded-full">
                  {pendingComplaints} pending
                </span>
              )}
            </div>
            {complaints.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-sm text-gray-400">No complaints submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {complaints.map(c => (
                  <div
                    key={c.id}
                    className={`flex items-start justify-between rounded-xl px-4 py-4 border ${
                      c.status === 'pending'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-gray-100 bg-white'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-800">
                          Slot {c.slot_number} — Floor {c.floor}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{c.reason}</p>
                      <p className="text-xs text-gray-400">
                        By: <span className="font-medium">{c.user_name}</span> · {c.email}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(c.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                        c.status === 'pending'
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {c.status === 'pending' ? '⏳ Pending' : '✅ Resolved'}
                      </span>
                      {c.status === 'pending' && (
                        <button
                          onClick={() => handleResolve(c.id)}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}