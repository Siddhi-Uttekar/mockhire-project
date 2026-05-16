import React from "react";

export default function AdminPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">Contact requests and other admin actions will appear here.</p>
      <div className="rounded border p-4 bg-white">
        <p className="text-sm text-gray-500">No items yet.</p>
      </div>
    </div>
  );
}
