import BackButton from "../components/BackButton";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="text-9xl font-bold text-yellow-200 mb-4 select-none">
        404
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4 relative z-10 -mt-16">
        Page Not Found
      </h1>
      <p className="text-gray-600 mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </p>
      <div className="flex gap-4">
        <BackButton label="Go Back" />
        <Link
          to="/"
          className="px-6 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition font-medium flex items-center gap-2"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
