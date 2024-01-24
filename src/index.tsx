import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { KindeProvider } from "@kinde-oss/kinde-auth-react";

interface AppState {
  redirectTo?: string;
}

const Main = () => {
  const navigate = useNavigate();

  return (
    <KindeProvider
      clientId="95a83eba55d9495db12c7af54b84b290"
      domain="https://discrescuenetwork.kinde.com"
      logoutUri={window.location.origin}
      redirectUri={window.location.origin}
      onRedirectCallback={(user, state) => {
        console.log({ user, state });

        // Using a type assertion here
        const app_state = state as AppState;

        if (app_state && app_state.redirectTo) {
          navigate(app_state.redirectTo);
        }
      }}
    >
      <App />
    </KindeProvider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Main />
    </BrowserRouter>
  </React.StrictMode>
);
