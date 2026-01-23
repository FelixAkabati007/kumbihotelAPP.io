import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";

type Addon = {
  id: string;
  name: string;
  price: string;
  taxable: number;
};

export default function ManageAddons() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [taxable, setTaxable] = useState(false);
  const token = useAuthStore((s) => s.token);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/addons")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load addons");
        return r.json();
      })
      .then(setAddons)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const clearFeedback = () => {
    setError(null);
    setSuccess(null);
  };

  const createAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!name || !price) {
      setError("Name and Price are required.");
      return;
    }

    try {
      const res = await fetch("/api/addons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          price: parseFloat(price).toFixed(2),
          taxable,
        }),
      });
      if (res.ok) {
        const newAddon = await res.json();
        setAddons([...addons, newAddon]);
        setName("");
        setPrice("");
        setTaxable(false);
        setSuccess("Addon created successfully.");
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to create addon");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const deleteAddon = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    clearFeedback();
    try {
      const res = await fetch(`/api/addons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAddons(addons.filter((a) => a.id !== id));
        setSuccess("Addon deleted.");
      } else {
        throw new Error("Failed to delete addon");
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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Add-ons</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {success}
        </div>
      )}
      {isLoading && <div className="text-gray-500 mb-4">Loading...</div>}

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Add-on</h2>
        <form onSubmit={createAddon} className="flex gap-4 items-end flex-wrap">
          <div>
            <label htmlFor="addonName" className="block text-sm font-medium">
              Name
            </label>
            <input
              id="addonName"
              className="border rounded p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="addonPrice" className="block text-sm font-medium">
              Price (GHS)
            </label>
            <input
              id="addonPrice"
              className="border rounded p-2"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="pb-3">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={taxable}
                onChange={(e) => setTaxable(e.target.checked)}
              />
              <span className="ml-2">Taxable</span>
            </label>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Create
          </button>
        </form>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Taxable
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {addons.map((a) => (
              <tr key={a.id}>
                <td className="px-6 py-4 whitespace-nowrap">{a.name}</td>
                <td className="px-6 py-4">
                  GHS {parseFloat(a.price).toFixed(2)}
                </td>
                <td className="px-6 py-4">{a.taxable ? "Yes" : "No"}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => deleteAddon(a.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
