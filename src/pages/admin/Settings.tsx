import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import BackButton from "../../components/BackButton";

type Setting = {
  id: string;
  key: string;
  value: string;
  description: string;
};

export default function Settings() {
  // Unused state variable 'settings' kept for future extensibility
  // but verified to fix lint error if removed, so we will remove unused usage if strictly needed
  const [, setSettings] = useState<Setting[]>([]);
  const [contactNumber, setContactNumber] = useState("");
  const token = useAuthStore((s) => s.token);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/settings", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSettings(data);
          const contact = data.find((s: Setting) => s.key === "contact_number");
          if (contact) setContactNumber(contact.value);
        }
      })
      .catch(console.error);
  }, [token]);

  const saveContactNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings/contact_number", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          value: contactNumber,
          description: "Main hotel contact number displayed in footer",
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setMessage({
        type: "success",
        text: "Contact number updated successfully",
      });

      setSettings((prev) => {
        const idx = prev.findIndex((s) => s.key === "contact_number");
        if (idx >= 0) {
          const newArr = [...prev];
          newArr[idx] = { ...newArr[idx], value: contactNumber };
          return newArr;
        }
        return prev;
      });

      // Dispatch event to notify listeners
      window.dispatchEvent(new Event("settings-updated"));
    } catch (err: unknown) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to update contact number" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <BackButton to="/admin" />
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {message && (
        <div
          className={`p-4 rounded mb-4 ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white/60 backdrop-blur-sm rounded shadow p-6 max-w-md">
        <h2 className="text-xl font-semibold mb-4">General Information</h2>
        <form onSubmit={saveContactNumber}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Contact Number
            </label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="+233..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Displayed in the site footer.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
