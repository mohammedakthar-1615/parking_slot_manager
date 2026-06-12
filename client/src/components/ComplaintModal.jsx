import { useState } from 'react';

const REASONS = [
  'Vehicle not present but slot marked occupied',
  'Wrong vehicle parked in this slot',
  'Slot is damaged or unusable',
  'Other',
];

export default function ComplaintModal({ slots, onSubmit, onClose, loading }) {
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleSubmit = () => {
    const reason = selectedReason === 'Other' ? customReason : selectedReason;
    if (!selectedSlot || !reason) return;
    onSubmit(selectedSlot, reason);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Submit Complaint</h2>
            <p className="text-xs text-gray-500 mt-0.5">Report a misused or wrongly occupied slot</p>
          </div>
          <span className="text-3xl">🚨</span>
        </div>

        {/* Slot Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Slot
          </label>
          <select
            value={selectedSlot}
            onChange={e => setSelectedSlot(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
          >
            <option value="">-- Choose a slot --</option>
            {slots
              .filter(s => s.status === 'occupied')
              .map(s => (
                <option key={s.id} value={s.id}>
                  Slot {s.slot_number} (Floor {s.floor})
                </option>
              ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">Only occupied slots are shown</p>
        </div>

        {/* Reason */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason
          </label>
          <div className="space-y-2">
            {REASONS.map(reason => (
              <label
                key={reason}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  selectedReason === reason
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="accent-red-500"
                />
                <span className="text-sm text-gray-700">{reason}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom reason input */}
        {selectedReason === 'Other' && (
          <div className="mb-4">
            <textarea
              value={customReason}
              onChange={e => setCustomReason(e.target.value)}
              placeholder="Describe your complaint..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !selectedSlot ||
              !selectedReason ||
              (selectedReason === 'Other' && !customReason) ||
              loading
            }
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-2.5 rounded-lg text-sm font-medium transition"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}