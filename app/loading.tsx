export default function Loading() {
  return (
    <div className="min-h-screen bg-[#1a2421] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-white rounded-full animate-spin"></div>
        </div>
        <p className="text-white text-lg font-semibold">Cargando...</p>
      </div>
    </div>
  );
}
