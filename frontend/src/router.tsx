import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import { Layout } from "@/components/Layout";

const HomePage = lazy(() => import("@/pages/HomePage").then((m) => ({ default: m.HomePage })));
const DashboardPage = lazy(() =>
  import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const CalibrationPage = lazy(() =>
  import("@/pages/CalibrationPage").then((m) => ({ default: m.CalibrationPage })),
);
const ProfilePage = lazy(() =>
  import("@/pages/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);
const HistoryPage = lazy(() =>
  import("@/pages/HistoryPage").then((m) => ({ default: m.HistoryPage })),
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);
const ErrorPage = lazy(() => import("@/pages/ErrorPage").then((m) => ({ default: m.ErrorPage })));

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: (
      <SuspenseWrapper>
        <ErrorPage />
      </SuspenseWrapper>
    ),
    children: [
      {
        path: "/",
        element: (
          <SuspenseWrapper>
            <HomePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/dashboard",
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/calibration",
        element: (
          <SuspenseWrapper>
            <CalibrationPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/history",
        element: (
          <SuspenseWrapper>
            <HistoryPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/profile",
        element: (
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    path: "*",
    element: (
      <SuspenseWrapper>
        <NotFoundPage />
      </SuspenseWrapper>
    ),
  },
]);
