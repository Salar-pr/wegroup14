import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      {/* Add shared dashboard navigation and header here. */}
      <Outlet />
    </div>
  );
}
