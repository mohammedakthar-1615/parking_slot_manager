import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SlotGrid from '../components/SlotGrid';
import BookingModal from '../components/BookingModal';
import PaymentModal from '../components/PaymentModal';
import ComplaintModal from '../components/ComplaintModal';
import Toast from '../components/Toast';
import API from '../api/axios';

export default function Dashboard() {
  const [slots, setSlots] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [showComplaint, setShowComplaint] = useState(false);
  const [myComplaints, setMyComplaints] = useState([]);

  const fetchSlots = async () => {
    const res = await API.get('/slots');
    setSlots(res.data);
  };

  const fetchMyBookings = async () => {
    const res = await API.get('/bookings/my');
    const history = res.data;
    setBookingHistory(history);
    const active = history.find(b => b.status === 'active');
    setActiveBooking(active || null);
  };

  const fetchMyComplaints = async () => {
    const res = await API.get('/complaints/my');
    setMyComplaints(res.data);
  };

  useEffect(() => {
    fetchSlots();
    fetchMyBookings();
    fetchMyComplaints();
  }, []);

  const handleBook = async (vehicleNumber) => {
    setBookingLoading(true);
    try {
      await API.post('/bookings', {
        slot_id: selectedSlot.id,
        vehicle_number: vehicleNumber,
      });
      setMessage('✅ Slot booked successfully!');
      setSelectedSlot(null);
      fetchSlots();
      fetchMyBookings();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Booking failed'));
    } finally {
      setBookingLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Step 1 — Click Release: calculate amount first
  const handleReleaseClick = async () => {
    try {
      const res = await API.get(`/bookings/calculate/${activeBooking.id}`);
      setPaymentSummary(res.data);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Failed to calculate'));
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Step 2 — Confirm payment & release
  const handlePayAndRelease = async () => {
    setReleaseLoading(true);
    try {
      await API.put(`/bookings/${activeBooking.id}/release`, {
        payment_confirmed: true,
      });
      setPaymentSummary(null);
      setMessage(
        paymentSummary.is_free
          ? '✅ Slot released — Free parking!'
          : `✅ Payment of ₹${paymentSummary.amount} confirmed. Slot released!`
      );
      fetchSlots();
      fetchMyBookings();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Release failed'));
    } finally {
      setReleaseLoading(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleComplaintSubmit = async (slot_id, reason) => {
    setComplaintLoading(true);
    try {
      await API.post('/complaints', { slot_id, reason });
      setShowComplaint(false);
      setMessage('✅ Complaint submitted successfully!');
      fetchMyComplaints();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Failed to submit'));
    } finally {
      setComplaintLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const available = slots.filter(s => s.status === 'available').length;
  const occupied = slots.filter(s => s.status === 'occupied').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="app-container py-8">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage your parking</p>
          </div>
          <button
            onClick={() => setShowComplaint(true)}
            className="flex items-center gap-2 text-sm text-red-500 border border-red-200 hover:bg-red-50 font-medium px-4 py-2 rounded-lg transition"
          >
            🚨 Report a Complaint
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-800">{slots.length}</div>
            <div className="text-sm text-gray-500 mt-1">Total Slots</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{available}</div>
            <div className="text-sm text-gray-500 mt-1">Available</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-red-500">{occupied}</div>
            <div className="text-sm text-gray-500 mt-1">Occupied</div>
          </div>
        </div>

        {/* Toast */}
        {message && (
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm mb-6 shadow-sm">
            {message}
          </div>
        )}

        {/* Active Booking Banner */}
        {activeBooking && (
          <div className="card px-5 py-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-800">
                🚗 Active Booking — Slot {activeBooking.slot_number} (Floor {activeBooking.floor})
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                Vehicle: {activeBooking.vehicle_number} · Checked in: {new Date(activeBooking.check_in).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={handleReleaseClick}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              Release
            </button>
          </div>
        )}

        {/* Slot Grid */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">
            Parking Slots
            {!activeBooking && (
              <span className="text-sm font-normal text-gray-400 ml-2">
                — click a green slot to book
              </span>
            )}
          </h2>
          <SlotGrid
            slots={slots}
            onSlotClick={setSelectedSlot}
            activeBooking={activeBooking}
          />
        </div>

        {/* Booking History */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">My Booking History</h2>
          {bookingHistory.length === 0 ? (
            <p className="text-sm text-gray-400">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {bookingHistory.map(b => (
                <div key={b.id} className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Slot {b.slot_number} · {b.vehicle_number}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      In: {new Date(b.check_in).toLocaleString()}
                      {b.check_out && ` · Out: ${new Date(b.check_out).toLocaleString()}`}
                      {b.status === 'completed' && (
                        <span className={`ml-2 font-semibold ${b.amount == 0 ? 'text-green-600' : 'text-blue-600'}`}>
                          · {b.amount == 0 ? 'FREE' : `₹${b.amount}`}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    b.status === 'active'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Complaints */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">My Complaints</h2>
          {myComplaints.length === 0 ? (
            <p className="text-sm text-gray-400">No complaints submitted.</p>
          ) : (
            <div className="space-y-3">
              {myComplaints.map(c => (
                <div key={c.id} className="flex items-start justify-between border border-gray-100 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Slot {c.slot_number} (Floor {c.floor})
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.reason}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(c.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                    c.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {c.status === 'pending' ? '⏳ Pending' : '✅ Resolved'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Booking Modal */}
      {selectedSlot && (
        <BookingModal
          slot={selectedSlot}
          onConfirm={handleBook}
          onClose={() => setSelectedSlot(null)}
          loading={bookingLoading}
        />
      )}

      {/* Payment Modal */}
      {paymentSummary && (
        <PaymentModal
          summary={paymentSummary}
          onPayAndRelease={handlePayAndRelease}
          onClose={() => setPaymentSummary(null)}
          loading={releaseLoading}
        />
      )}

      {/* Complaint Modal */}
      {showComplaint && (
        <ComplaintModal
          slots={slots}
          onSubmit={handleComplaintSubmit}
          onClose={() => setShowComplaint(false)}
          loading={complaintLoading}
        />
      )}

      {/* Toast */}
      {message && (
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm mb-6 shadow-sm">
          {message}
        </div>
      )}
      <Toast message={message} />
    </div>
  );
}