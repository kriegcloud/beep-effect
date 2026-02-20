import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HomePage } from "./pages/home";
import { AuthCallback } from "./pages/authCallback";
import { LoginPage } from "./pages/login";
import { AuthenticatedRoute } from "./utils/authenticatedRoute";

const root = createRoot(document.getElementById("root")!);

const router = createBrowserRouter([
    {
        path: "/",
        element: <AuthenticatedRoute />,
        children: [
            {
                path: "/",
                element: <HomePage />,
            },
        ],
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        // This is the route defined in your application's redirect URL
        path: "/auth/callback",
        element: <AuthCallback />,
    },
]);
root.render(<RouterProvider router={router} />);
