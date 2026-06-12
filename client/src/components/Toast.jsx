export default function Toast({ message }) {
  if (!message) return null;

  const isError = message.startsWith('❌');
  const isSuccess = message.startsWith('✅');

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] animate-bounce-in">
      <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium whitespace-nowrap ${
        isError
          ? 'bg-red-500 text-white'
          : isSuccess
          ? 'bg-green-500 text-white'
          : 'bg-gray-800 text-white'
      }`}>
        <span className="text-base">
          {isError ? '❌' : isSuccess ? '✅' : 'ℹ️'}
        </span>
        <span>{message.replace('❌ ', '').replace('✅ ', '')}</span>
      </div>
    </div>
  );
}