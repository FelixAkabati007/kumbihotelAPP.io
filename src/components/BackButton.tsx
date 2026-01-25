import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export default function BackButton({ to, label = "Back", className = "" }: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 ${className}`}
      aria-label={label}
    >
      <ArrowLeft size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );
}
