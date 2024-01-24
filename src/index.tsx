import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, useLocation } from "react-router-dom";
import { KindeProvider, useKindeAuth } from "@kinde-oss/kinde-auth-react";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <KindeProvider
        clientId="95a83eba55d9495db12c7af54b84b290"
        domain="https://discrescuenetwork.kinde.com"
        logoutUri={window.location.origin}
        redirectUri={window.location.origin}
        onRedirectCallback={(user, app_state) => {
          console.log({ user, app_state });
          // if (app_state?.redirectTo) {
          //   window.location = app_state?.redirectTo;
          // }
        }}
      >
        <App />
      </KindeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
