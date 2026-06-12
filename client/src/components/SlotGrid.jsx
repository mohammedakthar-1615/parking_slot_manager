export default function SlotGrid({ slots, onSlotClick, activeBooking }) {
  const floors = [...new Set(slots.map(s => s.floor))];

  return (
    <div className="space-y-6">
      {floors.map(floor => (
        <div key={floor}>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Floor {floor}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {slots
              .filter(s => s.floor === floor)
              .map(slot => {
                const isOccupied = slot.status === 'occupied';
                const isMySlot = activeBooking?.slot_id === slot.id;

                return (
                  <button
                    key={slot.id}
                    onClick={() => !isOccupied && onSlotClick(slot)}
                    disabled={isOccupied && !isMySlot}
                    className={`slot-card relative p-4 rounded-xl border-2 text-center transition-all w-full flex flex-col items-center justify-center
                      ${isMySlot
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : isOccupied
                        ? 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed'
                        : 'bg-white border-gray-100 text-gray-800 hover:bg-green-50 hover:scale-105 cursor-pointer'
                      }
                    `}
                  >
                    <div className="text-2xl mb-2">{isOccupied ? '🚗' : '🅿️'}</div>
                    <div className="text-sm font-semibold">{slot.slot_number}</div>
                    {isMySlot && (
                      <div className="text-[10px] font-medium mt-0.5">Your Slot</div>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex items-center gap-6 pt-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>🟢</span> Available
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>🚗</span> Occupied
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-3 h-3 rounded-full bg-blue-400 inline-block"></span> Your Slot
        </div>
      </div>
    </div>
  );
}