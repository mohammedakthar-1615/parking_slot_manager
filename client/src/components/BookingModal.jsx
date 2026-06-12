import { useState } from 'react';

export default function BookingModal({ slot, onConfirm, onClose, loading }) {
  const [vehicleNumber, setVehicleNumber] = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 modal-backdrop flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md card">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Book Slot {slot.slot_number}</h2>
            <p className="text-sm text-gray-500">Floor {slot.floor} · Enter your vehicle number</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="mt-4">
          <input
            type="text"
            value={vehicleNumber}
            onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
            placeholder="e.g. TN01AB1234"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 uppercase"
          />

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(vehicleNumber)}
              disabled={!vehicleNumber || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-lg text-sm font-medium transition"
            >
              {loading ? 'Booking...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}