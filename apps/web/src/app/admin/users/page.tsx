"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Users, DollarSign, Download, Trash2, RefreshCw } from "lucide-react";

// ---- Types ----

interface UserRow {
  id: string;
  name: string;
  phone: string;
  vertical: string | null;
  lifecycleState: string;
  isPro: boolean;
  daysSinceLastContact: number | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface CostMetrics {
  totalCostBRL: string;
  totalUsers: number;
  totalCalls: number;
  avgCostPerUserBRL: string;
}

// ---- Helpers ----

const LIFECYCLE_COLORS: Record<string, string> = {
  provisional: "bg-gray-600",
  onboarding: "bg-blue-600",
  active: "bg-green-600",
  at_risk: "bg-yellow-600",
  churned: "bg-red-600",
  pro_offer_pending: "bg-purple-600",
  awaiting_lgpd_confirmation: "bg-orange-600",
};

function getAuthHeader(): string {
  return `Bearer ${prompt("Admin secret:") ?? ""}`;
}

// ---- Component ----

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, pages: 0 });
  const [metrics, setMetrics] = useState<CostMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const auth = getAuthHeader();
      const res = await fetch(`/api/v1/admin/users?page=${page}&limit=50`, {
        headers: { Authorization: auth },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const auth = getAuthHeader();
      const res = await fetch("/api/v1/admin/metrics/cost", {
        headers: { Authorization: auth },
      });
      if (!res.ok) return;
      const data = await res.json();
      setMetrics(data.metrics);
    } catch {
      // Metrics are optional
    }
  }, []);

  useEffect(() => {
    fetchUsers(1);
    fetchMetrics();
  }, [fetchUsers, fetchMetrics]);

  const handleExport = async (userId: string) => {
    try {
      const auth = getAuthHeader();
      const res = await fetch(`/api/v1/admin/users/${userId}/export`, {
        method: "POST",
        headers: { Authorization: auth },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user-${userId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Export failed: " + (err instanceof Error ? err.message : err));
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Tem certeza que deseja apagar esta conta? (LGPD soft delete)")) return;
    try {
      const auth = getAuthHeader();
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: auth },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert("Delete failed: " + (err instanceof Error ? err.message : err));
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-[#00D97E]" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111827] rounded-lg p-4 border border-[#1E293B]">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Users className="w-4 h-4" /> Total Usuarios
            </div>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </div>
          <div className="bg-[#111827] rounded-lg p-4 border border-[#1E293B]">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <DollarSign className="w-4 h-4" /> Custo 30d
            </div>
            <div className="text-2xl font-bold">R$ {metrics?.totalCostBRL ?? "0.00"}</div>
          </div>
          <div className="bg-[#111827] rounded-lg p-4 border border-[#1E293B]">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <DollarSign className="w-4 h-4" /> Custo/Aluno
            </div>
            <div className="text-2xl font-bold">R$ {metrics?.avgCostPerUserBRL ?? "0.00"}</div>
          </div>
          <div className="bg-[#111827] rounded-lg p-4 border border-[#1E293B]">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <RefreshCw className="w-4 h-4" /> Calls 30d
            </div>
            <div className="text-2xl font-bold">{metrics?.totalCalls ?? 0}</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 mb-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-[#111827] rounded-lg border border-[#1E293B] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#1E293B]">
            <h2 className="font-semibold">Usuarios</h2>
            <button
              onClick={() => fetchUsers(pagination.page)}
              disabled={loading}
              className="text-sm text-[#00D97E] hover:underline disabled:opacity-50"
            >
              {loading ? "Carregando..." : "Atualizar"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E293B] text-gray-400 text-left">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Telefone</th>
                  <th className="px-4 py-3">Vertical</th>
                  <th className="px-4 py-3">Lifecycle</th>
                  <th className="px-4 py-3">Pro</th>
                  <th className="px-4 py-3">Ultimo contato</th>
                  <th className="px-4 py-3">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[#1E293B] hover:bg-[#1A2332]">
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{u.phone}</td>
                    <td className="px-4 py-3">{u.vertical ?? "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs text-white ${LIFECYCLE_COLORS[u.lifecycleState] ?? "bg-gray-700"}`}>
                        {u.lifecycleState}
                      </span>
                    </td>
                    <td className="px-4 py-3">{u.isPro ? "Pro" : "Free"}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {u.daysSinceLastContact !== null ? `${u.daysSinceLastContact}d` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleExport(u.id)}
                          className="p-1 hover:bg-[#1E293B] rounded"
                          title="Exportar dados (LGPD)"
                        >
                          <Download className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-1 hover:bg-[#1E293B] rounded"
                          title="Apagar conta (LGPD)"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-[#1E293B] text-sm">
              <span className="text-gray-400">
                Pagina {pagination.page} de {pagination.pages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchUsers(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
                  className="px-3 py-1 bg-[#1E293B] rounded disabled:opacity-50 hover:bg-[#2D3B4E]"
                >
                  Anterior
                </button>
                <button
                  onClick={() => fetchUsers(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages || loading}
                  className="px-3 py-1 bg-[#1E293B] rounded disabled:opacity-50 hover:bg-[#2D3B4E]"
                >
                  Proxima
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
