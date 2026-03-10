import React from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  ListChecks,
  BookCheck,
  Clock,
  History,
  Book,
} from "lucide-react";

const AdminDashboard = () => {
  const quickActions = [
    {
      title: "Add New Book",
      description: "Add a new book to the library collection",
      icon: PlusCircle,
      link: "/admin/books/new",
      color: "bg-emerald-600",
    },
    {
      title: "Manage Books",
      description: "View, edit or delete existing books",
      icon: ListChecks,
      link: "/admin/books",
      color: "bg-blue-600",
    },
    {
      title: "Add Events",
      description: "Add an event",
      icon: BookCheck,
      link: "/admin/events",
      color: "bg-green-400",
    },
    {
      title: "Set Prayer Time",
      description: "Set the prayer times",
      icon: Clock,
      link: "/admin/prayer-settings",
      color: "bg-blue-400",
    },
    {
      title: "Borrowing User History",
      description: "See the user who borrowed the books",
      icon: History,
      link: "/admin/borrowers",
      color: "bg-green-700",
    },
    {
      title: "Request for Book",
      description: "See the request of the users to borrow the books",
      icon: Book,
      link: "/admin/borrow-requests",
      color: "bg-blue-700",
    },
  ];

  return (
    <div className="min-h-screen bg-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-800">
            Admin Dashboard
          </h1>
          <p className="text-emerald-600 mt-1">
            Welcome back! Manage your mosque library efficiently
          </p>
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-semibold text-emerald-700 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <div
                className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
              >
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                {action.title}
              </h3>
              <p className="text-gray-600 text-sm">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
