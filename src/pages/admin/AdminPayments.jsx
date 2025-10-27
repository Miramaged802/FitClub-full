import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";
import { paymentTransactions, supabase } from "../../lib/supabaseClient";
import {
  FiCalendar,
  FiCreditCard,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiFileText,
} from "react-icons/fi";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userMap, setUserMap] = useState({});

  const load = async () => {
    setIsLoading(true);
    const { data } = await paymentTransactions.getAllAdmin({ status });
    setPayments(data || []);
    // Build user map for names
    const ids = Array.from(
      new Set((data || []).map((p) => p.user_id).filter(Boolean))
    );
    if (ids.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .in("user_id", ids);
      const map = {};
      (profiles || []).forEach((p) => {
        const name = [p.first_name, p.last_name]
          .filter(Boolean)
          .join(" ")
          .trim();
        map[p.user_id] = name || "Member";
      });
      setUserMap(map);
    } else {
      setUserMap({});
    }
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return payments.filter((p) =>
      [p.description, p.payment_method, p.status]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [payments, query]);

  const exportCsv = () => {
    const rows = [
      ["id", "user_name", "amount", "status", "payment_method", "created_at"],
      ...filtered.map((p, idx) => [
        idx + 1,
        userMap[p.user_id] || "Member",
        p.amount,
        p.status,
        p.payment_method,
        p.created_at,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    const rows = filtered.map((p, idx) => ({
      num: idx + 1,
      user: userMap[p.user_id] || "Member",
      amount: `$${(p.amount || 0).toFixed(2)}`,
      method: p.payment_method || "n/a",
      status: p.status,
      date: new Date(p.created_at).toLocaleString(),
    }));

    const styles = `
      <style>
        body{font-family: Arial, Helvetica, sans-serif; padding:16px; color:#111}
        h1{font-size:18px; margin:0 0 12px 0}
        table{width:100%; border-collapse:collapse}
        th,td{font-size:12px; text-align:left; padding:8px; border-bottom:1px solid #ddd}
        th{background:#f6f6f6}
      </style>
    `;

    const header = `<h1>Payments Export</h1>`;
    const thead = `<tr><th>#</th><th>User</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr>`;
    const tbody = rows
      .map(
        (r) =>
          `<tr><td>${r.num}</td><td>${r.user}</td><td>${r.amount}</td><td>${r.method}</td><td>${r.status}</td><td>${r.date}</td></tr>`
      )
      .join("");

    const html = `<!doctype html><html><head><meta charset="utf-8"/>${styles}</head><body>${header}<table>${thead}${tbody}</table></body></html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    // Give the browser a tick to render, then print
    setTimeout(() => {
      w.print();
      w.close();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 py-8 px-4 sm:px-8">
          <div className="container-custom">
            <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-1">Payments</h1>
                <p className="text-light-textSecondary dark:text-dark-textSecondary">
                  Review and manage payments
                </p>
              </div>
              <div className="flex gap-3 items-center">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input"
                >
                  <option value="">All statuses</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="input w-56"
                />
                <div className="flex gap-2">
                  <button
                    onClick={exportCsv}
                    className="btn-secondary inline-flex items-center gap-2 px-3 py-2 rounded-lg"
                    title="Export CSV"
                  >
                    <FiDownload /> Excel
                  </button>
                  <button
                    onClick={exportPdf}
                    className="btn-primary inline-flex items-center gap-2 px-3 py-2 rounded-lg"
                    title="Export PDF"
                  >
                    <FiFileText /> PDF
                  </button>
                </div>
              </div>
            </div>

            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-light-border dark:border-dark-border bg-light-hover/50 dark:bg-dark-hover/30">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Method</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="5" className="py-6 text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : filtered.length ? (
                      filtered.map((p, idx) => (
                        <tr
                          key={p.id}
                          className="border-b border-light-border dark:border-dark-border"
                        >
                          <td className="py-3 px-4 font-mono text-xs">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            {userMap[p.user_id] || "Member"}
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            ${(p.amount || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 flex items-center gap-2">
                            <FiCreditCard /> {p.payment_method || "n/a"}
                          </td>
                          <td className="py-3 px-4">
                            {p.status === "completed" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200">
                                <FiCheckCircle /> Completed
                              </span>
                            ) : p.status === "failed" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200">
                                <FiXCircle /> Failed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <FiCalendar size={14} />
                              {new Date(p.created_at).toLocaleString()}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-6 text-center text-light-textSecondary dark:text-dark-textSecondary"
                        >
                          No payments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
