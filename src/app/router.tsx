import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Add feature routes here as pages are implemented.
export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [],
  },
  {
    element: <AuthLayout />,
    children: [],
  },
  {
    element: <DashboardLayout />,
    children: [],
  },
]);
