import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 text-center">
      <div>
        <h1 className="text-7xl font-extrabold text-orange-500 mb-2">404</h1>
        <p className="text-xl font-semibold text-gray-800 mb-2">Page Not Found</p>
        <p className="text-gray-500 text-sm mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
