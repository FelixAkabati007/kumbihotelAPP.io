import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import BackButton from "../../components/BackButton";

type RatePlan = {
  id: string;
  name: string;
  description: string;
  currency: string;
};

type Season = {
  id: string;
  startDate: string;
  endDate: string;
  dayOfWeekMask: string;
  price: string;
};

export default function RatePlans() {
  const [plans, setPlans] = useState<RatePlan[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("GHS");
  const token = useAuthStore((s) => s.token);

  const [selectedPlan, setSelectedPlan] = useState<RatePlan | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);

  // Season form
  const [sStart, setSStart] = useState("");
  const [sEnd, setSEnd] = useState("");
  const [sPrice, setSPrice] = useState("");
  const [sDays, setSDays] = useState<boolean[]>(new Array(7).fill(true));

  // Feedback & Loading
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/rate-plans", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load rate plans");
        return r.json();
      })
      .then(setPlans)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [token]);

  useEffect(() => {
    if (!selectedPlan) return;
    setIsLoading(true);
    fetch(`/api/rate-plans/${selectedPlan.id}/seasons`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load seasons");
        return r.json();
      })
      .then(setSeasons)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [selectedPlan, token]);

  const clearFeedback = () => {
    setError(null);
    setSuccess(null);
  };

  const createPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!name || !currency) {
      setError("Name and Currency are required.");
      return;
    }

    try {
      const res = await fetch("/api/rate-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, currency }),
      });
      if (res.ok) {
        const newPlan = await res.json();
        setPlans([...plans, newPlan]);
        setName("");
        setDescription("");
        setCurrency("GHS");
        setSuccess("Rate plan created successfully.");
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to create rate plan");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    clearFeedback();
    try {
      const res = await fetch(`/api/rate-plans/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPlans(plans.filter((p) => p.id !== id));
        if (selectedPlan?.id === id) setSelectedPlan(null);
        setSuccess("Rate plan deleted.");
      } else {
        throw new Error("Failed to delete plan");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const createSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    clearFeedback();

    if (!sStart || !sEnd || !sPrice) {
      setError("All fields are required for a season.");
      return;
    }

    if (new Date(sEnd) <= new Date(sStart)) {
      setError("End date must be after start date.");
      return;
    }

    const mask = sDays.map((d) => (d ? "1" : "0")).join("");
    try {
      const res = await fetch(`/api/rate-plans/${selectedPlan.id}/seasons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startDate: sStart,
          endDate: sEnd,
          dayOfWeekMask: mask,
          price: sPrice,
        }),
      });
      if (res.ok) {
        const newSeason = await res.json();
        setSeasons((prev) => [...prev, newSeason]);
        setSStart("");
        setSEnd("");
        setSPrice("");
        setSuccess("Season added successfully.");
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to create season");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <div className="p-6">
      <BackButton to="/admin" />
      <h1 className="text-2xl font-bold mb-4">Rate Plans Management</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {success}
        </div>
      )}
      {isLoading && <div className="text-gray-500 mb-4">Loading...</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Create New Plan</h2>
          <form
            onSubmit={createPlan}
            className="space-y-4 border p-4 rounded bg-white shadow-sm"
          >
            <div>
              <label htmlFor="planName" className="block text-sm font-medium">
                Name
              </label>
              <input
                id="planName"
                className="w-full border rounded p-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="planDesc" className="block text-sm font-medium">
                Description
              </label>
              <input
                id="planDesc"
                className="w-full border rounded p-2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="planCurrency"
                className="block text-sm font-medium"
              >
                Currency
              </label>
              <select
                id="planCurrency"
                className="w-full border rounded p-2"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="GHS">GHS</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Create Plan
            </button>
          </form>

          <h2 className="text-xl font-semibold mt-6 mb-2">Existing Plans</h2>
          <ul className="space-y-2">
            {plans.map((p) => (
              <li
                key={p.id}
                className={`border p-3 rounded flex justify-between items-center cursor-pointer hover:bg-gray-50 ${
                  selectedPlan?.id === p.id
                    ? "border-blue-500 ring-1 ring-blue-500"
                    : ""
                }`}
                onClick={() => setSelectedPlan(p)}
              >
                <div>
                  <p className="font-bold">{p.name}</p>
                  <p className="text-sm text-gray-500">{p.description}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePlan(p.id);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          {selectedPlan ? (
            <>
              <h2 className="text-xl font-semibold mb-2">
                Seasons for "{selectedPlan.name}"
              </h2>
              <form
                onSubmit={createSeason}
                className="space-y-4 border p-4 rounded bg-white shadow-sm mb-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="seasonStart"
                      className="block text-sm font-medium"
                    >
                      Start Date
                    </label>
                    <input
                      id="seasonStart"
                      type="date"
                      className="w-full border rounded p-2"
                      value={sStart}
                      onChange={(e) => setSStart(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="seasonEnd"
                      className="block text-sm font-medium"
                    >
                      End Date
                    </label>
                    <input
                      id="seasonEnd"
                      type="date"
                      className="w-full border rounded p-2"
                      value={sEnd}
                      onChange={(e) => setSEnd(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="seasonPrice"
                    className="block text-sm font-medium"
                  >
                    Price Adjustment
                  </label>
                  <input
                    id="seasonPrice"
                    type="number"
                    step="0.01"
                    className="w-full border rounded p-2"
                    value={sPrice}
                    onChange={(e) => setSPrice(e.target.value)}
                    required
                    placeholder="e.g. 150.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Active Days
                  </label>
                  <div className="flex space-x-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day, i) => (
                        <label
                          key={day}
                          htmlFor={`day-${i}`}
                          className="flex flex-col items-center cursor-pointer"
                        >
                          <span className="text-xs">{day}</span>
                          <input
                            id={`day-${i}`}
                            type="checkbox"
                            checked={sDays[i]}
                            onChange={(e) => {
                              const newDays = [...sDays];
                              newDays[i] = e.target.checked;
                              setSDays(newDays);
                            }}
                          />
                        </label>
                      ),
                    )}
                  </div>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Add Season
                </button>
              </form>

              <div className="space-y-2">
                {seasons.length === 0 && (
                  <p className="text-gray-500">No seasons defined.</p>
                )}
                {seasons.map((s) => (
                  <div key={s.id} className="border p-3 rounded bg-gray-50">
                    <p className="font-semibold">
                      {new Date(s.startDate).toLocaleDateString()} -{" "}
                      {new Date(s.endDate).toLocaleDateString()}
                    </p>
                    <p>Price: {s.price}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      Mask: {s.dayOfWeekMask}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed rounded p-10">
              Select a plan to manage seasons
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
