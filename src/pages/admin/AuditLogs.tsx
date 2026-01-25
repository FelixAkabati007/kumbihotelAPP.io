import { useEffect, useState } from "react";
import BackButton from "../../components/BackButton";
import { useAuthStore } from "../../store/authStore";

type AuditLog = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  details: Record<string, unknown> | null;
  createdAt: string;
  actorUserId: string | null;
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((s) => s.token);
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchLogs = (p: number) => {
    setLoading(true);
    fetch(`/api/audit-logs?page=${p}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page, token]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-3xl font-bold text-gray-800">Audit Logs</h1>
        </div>
        <button
          onClick={() => fetchLogs(page)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Time</th>
                <th className="p-4 font-semibold text-gray-600">Action</th>
                <th className="p-4 font-semibold text-gray-600">Entity</th>
                <th className="p-4 font-semibold text-gray-600">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition"
                  >
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <span className="font-medium text-gray-800">
                        {log.entityType}
                      </span>
                      <span className="text-gray-400 mx-1">#</span>
                      <span className="font-mono text-xs">{log.entityId.slice(0, 8)}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-600 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page}</span>
          <button
            disabled={logs.length < limit}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
