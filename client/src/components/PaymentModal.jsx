import { useState } from 'react';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: '📱', desc: 'GPay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, Rupay' },
  { id: 'netbanking', label: 'Net Banking', icon: '🏦', desc: 'All major banks' },
  { id: 'wallet', label: 'Wallet', icon: '👛', desc: 'Paytm, Amazon Pay' },
];

export default function PaymentModal({ summary, onPayAndRelease, onClose, loading }) {
  const { amount, is_free, duration_mins, duration_hrs, check_in } = summary;
  const [step, setStep] = useState('bill');        // bill → method → processing → done
  const [selectedMethod, setSelectedMethod] = useState('');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [bank, setBank] = useState('');

  const handleProceed = () => {
    if (is_free) {
      onPayAndRelease();
      return;
    }
    setStep('method');
  };

  const handlePayNow = () => {
    // Validate inputs
    if (selectedMethod === 'upi' && !upiId) return;
    if (selectedMethod === 'card' && (!cardNumber || !cardExpiry || !cardCvv || !cardName)) return;
    if (selectedMethod === 'netbanking' && !bank) return;

    setStep('processing');
    // Simulate payment processing (2 seconds)
    setTimeout(() => {
      setStep('done');
    }, 2000);
  };

  const handleDone = () => {
    onPayAndRelease();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">

        {/* ─── STEP 1: Bill Summary ─── */}
        {step === 'bill' && (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">{is_free ? '🎉' : '🧾'}</div>
              <h2 className="text-xl font-bold text-gray-800">
                {is_free ? 'Free Parking!' : 'Parking Bill'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {is_free ? 'You parked under 1 hour — no charge!' : 'Review your bill before payment'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Check In</span>
                <span className="font-medium text-gray-800">
                  {new Date(check_in).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium text-gray-800">
                  {duration_mins < 60
                    ? `${duration_mins} min`
                    : `${parseFloat(duration_hrs).toFixed(1)} hrs`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Rate</span>
                <span className="font-medium text-gray-800">
                  {is_free ? 'Free (under 1 hr)' : '₹20 / hour'}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                <span className="font-semibold text-gray-700">Total Amount</span>
                <span className={`text-2xl font-bold ${is_free ? 'text-green-600' : 'text-blue-600'}`}>
                  {is_free ? 'FREE' : `₹${amount}`}
                </span>
              </div>
              {!is_free && (
                <p className="text-xs text-gray-400 text-center">
                  ₹20 × {Math.ceil(parseFloat(duration_hrs))} hr{Math.ceil(parseFloat(duration_hrs)) > 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="bg-blue-50 rounded-lg px-4 py-2.5 mb-5 text-xs text-blue-700 flex gap-2">
              <span>ℹ️</span>
              <span>First hour free · ₹20 per hour after that</span>
            </div>

            <div className="flex gap-3">
              {!is_free && (
                <button
                  onClick={onClose}
                  className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleProceed}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition ${
                  is_free
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {is_free ? '✅ Release Slot' : 'Proceed to Pay →'}
              </button>
            </div>
          </>
        )}

        {/* ─── STEP 2: Payment Method ─── */}
        {step === 'method' && (
          <>
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => setStep('bill')}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ←
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Choose Payment</h2>
                <p className="text-xs text-gray-500">Select a method to pay ₹{amount}</p>
              </div>
            </div>

            {/* Method Selection */}
            <div className="space-y-2 mb-5">
              {PAYMENT_METHODS.map(method => (
                <label
                  key={method.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={() => setSelectedMethod(method.id)}
                    className="accent-blue-600"
                  />
                  <span className="text-xl">{method.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{method.label}</p>
                    <p className="text-xs text-gray-400">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* UPI Input */}
            {selectedMethod === 'upi' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Card Input */}
            {selectedMethod === 'card' && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    value={cardNumber}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                      setCardNumber(val.replace(/(.{4})/g, '$1 ').trim());
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setCardExpiry(val.length > 2 ? val.slice(0,2) + '/' + val.slice(2) : val);
                      }}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={3}
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Net Banking */}
            {selectedMethod === 'netbanking' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Bank</label>
                <select
                  value={bank}
                  onChange={e => setBank(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Select your bank --</option>
                  <option>State Bank of India</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                  <option>Punjab National Bank</option>
                  <option>Bank of Baroda</option>
                </select>
              </div>
            )}

            {/* Wallet */}
            {selectedMethod === 'wallet' && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-700">
                💛 You will be redirected to your wallet app to complete payment.
              </div>
            )}

            <button
              onClick={handlePayNow}
              disabled={
                !selectedMethod ||
                (selectedMethod === 'upi' && !upiId) ||
                (selectedMethod === 'card' && (!cardNumber || !cardExpiry || !cardCvv || !cardName)) ||
                (selectedMethod === 'netbanking' && !bank)
              }
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-lg text-sm font-semibold transition"
            >
              💳 Pay ₹{amount} Now
            </button>
          </>
        )}

        {/* ─── STEP 3: Processing ─── */}
        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4 animate-bounce">⏳</div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Processing Payment</h2>
            <p className="text-sm text-gray-500">Please wait, do not close this window...</p>
            <div className="mt-6 flex justify-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {/* ─── STEP 4: Success ─── */}
        {step === 'done' && (
          <div className="text-center py-4">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Payment Successful!</h2>
            <p className="text-sm text-gray-500 mb-2">₹{amount} paid successfully</p>

            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-semibold text-green-600">₹{amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-800 capitalize">{selectedMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-green-600">Paid ✓</span>
              </div>
            </div>

            <button
              onClick={handleDone}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold transition"
            >
              {loading ? 'Releasing...' : '🚗 Release Slot'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}