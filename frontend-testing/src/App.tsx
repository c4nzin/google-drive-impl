import { type SyntheticEvent, useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthTab = "login" | "register";

function App() {
  const [tab, setTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [tokens, setTokens] = useState<Tokens | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem("nestcloud_tokens");
    return stored ? JSON.parse(stored) : null;
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isLoggedIn = Boolean(tokens?.accessToken);

  useEffect(() => {
    if (tokens) {
      window.localStorage.setItem("nestcloud_tokens", JSON.stringify(tokens));
    } else {
      window.localStorage.removeItem("nestcloud_tokens");
    }
  }, [tokens]);

  const activeTabLabel = useMemo(() => {
    return tab === "login" ? "Sign in" : "Create account";
  }, [tab]);

  const bodyForTab = () => {
    if (tab === "register") {
      return (
        <>
          <label>
            Username
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="your username"
              required
            />
          </label>
          <div className="side-by-side">
            <label>
              First name
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Can"
              />
            </label>
            <label>
              Last name
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Mert"
              />
            </label>
          </div>
        </>
      );
    }

    return null;
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let response: Response;
      let data: any;

      if (tab === "login") {
        response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        data = await response.json();
        if (!response.ok) {
          const errMsg =
            data?.message ??
            data?.code ??
            data?.statusCode ??
            JSON.stringify(data);
          throw new Error(errMsg);
        }
        setTokens(data.tokens);
        setMessage("Signed in successfully.");
      }

      if (tab === "register") {
        response = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            email,
            password,
            firstName,
            lastName,
          }),
        });
        data = await response.json();
        if (!response.ok) {
          const errMsg =
            data?.message ??
            data?.code ??
            data?.statusCode ??
            JSON.stringify(data);
          throw new Error(errMsg);
        }
        setMessage("Account created. Please sign in.");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    setTokens(null);
    setMessage("Signed out.");
  };

  return (
    <div className="page-shell">
      <div className="window-shell">
        <div className="brand-header">
          <div className="brand-icon">N</div>
          <div>
            <h1>Nestcloud</h1>
            <p>Elegant auth demo with login and register.</p>
          </div>
        </div>

        {!isLoggedIn ? (
          <section className="auth-card">
            <div className="tabs-row">
              {(["login", "register"] as AuthTab[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={item === tab ? "tab-button active" : "tab-button"}
                  onClick={() => setTab(item)}
                >
                  {item === "login" ? "Login" : "Register"}
                </button>
              ))}
            </div>

            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a secure password"
                  required
                />
              </label>
              {bodyForTab()}

              <button
                className="submit-button"
                type="submit"
                disabled={loading}
              >
                {loading ? "Working..." : activeTabLabel}
              </button>
            </form>

            <p className="status-text">{message}</p>
          </section>
        ) : (
          <section className="dashboard-card">
            <div className="dashboard-top">
              <button
                className="logout-button"
                type="button"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
