export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <p className="text-7xl font-extrabold text-navy mb-2">
        4<span className="text-gold">0</span>4
      </p>
      <h1 className="text-2xl font-extrabold mb-3">This page could not be found</h1>
      <p className="text-gray-600 mb-8">
        The page you are looking for does not exist — but your IELTS practice is right here.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/" className="btn-primary">Back to Home</a>
        <a href="/mock" className="btn-secondary">Take a Free Mock Test</a>
      </div>
    </div>
  );
}
