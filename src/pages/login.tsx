import React, { useCallback, useState } from "react";
import { Navigate } from "react-router-dom";

import "./login.scss";
import { client } from "../utils/client";

export const LoginPage: React.FC = () => {
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const token = client.auth.token;

    const onLoginClick = useCallback(async () => {
        setIsLoggingIn(true);
        try {
            // Initiate the OAuth flow, which will redirect the user to log into Foundry
            // Once the login has completed, the user will be redirected back to the route defined via the
            // APPLICATION_REDIRECT_URL variable in .env.development
            await client.auth.signIn();
        } catch (err: any) {
            setError(err.message ?? err);
        }
    }, []);

    // If the token exists but a user tries to load /login, redirect to the home page instead
    if (token != null) {
        return <Navigate to="/" replace={true} />;
    }

    return (
        <div className="login">
            <h1>Please log in</h1>
            <button onClick={onLoginClick}>{isLoggingIn ? "Logging in…" : "Log in "}</button>
            {error && <div>Unable to log in: {error}</div>}
        </div>
    );
};
