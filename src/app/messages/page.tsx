"use client";

import { useEffect, useState } from "react";

type Contact = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/contacts", { cache: "no-store" });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    const res = await fetch(`/api/contacts/${id}`, { method: "PUT" });
    if (res.ok) {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === id ? { ...msg, isRead: true } : msg))
      );
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    if (res.ok) setMessages((prev) => prev.filter((msg) => msg._id !== id));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-cyan-400">Messages</h1>
        <button
          onClick={load}
          className="rounded bg-cyan-500 px-4 py-2 text-black font-medium hover:bg-cyan-400"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">From</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Message</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800 bg-gray-950">
            {loading ? (
              <tr>
                <td className="px-4 py-5 text-gray-400" colSpan={6}>
                  Loading…
                </td>
              </tr>
            ) : messages.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-gray-400" colSpan={6}>
                  No messages found.
                </td>
              </tr>
            ) : (
              messages.map((msg) => (
                <tr
                  key={msg._id}
                  className={`transition-colors ${
                    msg.isRead ? "bg-gray-950" : "bg-gray-900"
                  } hover:bg-gray-800`}
                >
                  <td className="px-4 py-3 text-white font-medium">
                    {msg.name}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{msg.email}</td>
                  <td className="px-4 py-3 text-gray-300">{msg.phone || "-"}</td>
                  <td className="px-4 py-3 text-gray-300 max-w-xs break-words">
                    {msg.message}
                  </td>
                  <td className="px-4 py-3">
                    {msg.isRead ? (
                      <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-3 py-1 text-xs font-semibold">
                        Read
                      </span>
                    ) : (
                      <span className="rounded-full bg-rose-500/20 text-rose-400 px-3 py-1 text-xs font-semibold">
                        New
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {!msg.isRead && (
                        <button
                          onClick={() => markAsRead(msg._id)}
                          className="rounded bg-yellow-400 px-3 py-1.5 text-black hover:bg-yellow-300"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => remove(msg._id)}
                        className="rounded bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-500"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
