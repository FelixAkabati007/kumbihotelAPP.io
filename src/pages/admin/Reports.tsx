import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import BackButton from "../../components/BackButton";

type Invoice = {
  id: string;
  invoiceNumber: string;
  totalAmount: string;
  status: string;
  createdAt: string;
};

export default function Reports() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    fetch("/api/invoices", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setInvoices)
      .catch(console.error);
  }, [token]);

  const totalRevenue = invoices.reduce(
    (sum, inv) => sum + parseFloat(inv.totalAmount),
    0,
  );

  return (
    <div className="container mx-auto p-6">
      <BackButton to="/admin" />
      <h1 className="text-3xl font-bold mb-6">Financial Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
          <p className="text-3xl font-bold">GHS {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium">Total Invoices</h3>
          <p className="text-3xl font-bold">{invoices.length}</p>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Invoices</h2>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {inv.invoiceNumber}
                </td>
                <td className="px-6 py-4">
                  {new Date(inv.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${inv.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  GHS {parseFloat(inv.totalAmount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
