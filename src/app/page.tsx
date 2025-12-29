"use client";

import { useEffect, useState } from "react";

type Stats = {
  projects: number;
  skills: number;
  messages: number;
};

export default function DashboardHome() {
  const [stats, setStats] = useState<Stats>({ projects: 0, skills: 0, messages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, skillRes, msgRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/skills"),
          fetch("/api/contacts"),
        ]);

        const projects = await projRes.json();
        const skills = await skillRes.json();
        const messages = await msgRes.json();

        setStats({
          projects: projects.length || 0,
          skills: skills.length || 0,
          messages: messages.length || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-cyan-400">Dashboard Overview</h1>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading stats...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg text-center">
            <h2 className="text-xl font-semibold text-white">Projects</h2>
            <p className="text-4xl font-bold text-cyan-400 mt-2">{stats.projects}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg text-center">
            <h2 className="text-xl font-semibold text-white">Skills</h2>
            <p className="text-4xl font-bold text-cyan-400 mt-2">{stats.skills}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg text-center">
            <h2 className="text-xl font-semibold text-white">Messages</h2>
            <p className="text-4xl font-bold text-cyan-400 mt-2">{stats.messages}</p>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-semibold text-cyan-300 mb-4">
        Recent Messages
      </h2>

      <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg">
        <p className="text-gray-400">
          Recent messages will appear here (we'll build this soon).
        </p>
      </div>
    </div>
  );
}