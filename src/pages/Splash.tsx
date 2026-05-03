
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Splash() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      if (isAuthenticated) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }, 1000);
  }, [isAuthenticated]);

  return (
    <div className="mt-58 flex flex-col items-center">
        {/* Tagline */}
        <p className="text-base text-blue-700 uppercase tracking-widest sm:mb-8 font-semibold">
          Communication made secure
        </p>

        {/* Loading Indicator */}
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          {/* Progress Bar */}
          <div className="w-32 sm:w-40 md:w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-gray-800 rounded-full animate-slide"></div>
          </div>

          {/* Loading Text */}
          <p className="text-xs sm:text-sm text-gray-400 font-medium">
            Confirming authentication...
          </p>
        </div>
    </div>);
}
