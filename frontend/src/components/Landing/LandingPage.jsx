import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

const FUNCTIONS = process.env.REACT_APP_FUNCTIONS_BASE_URL;

function LandingPage() {
  const [projectName, setProjectName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const INVALID_CHARS = /[.#$[\]/]/;

  // Cloud Function: initializeProject
  const initializeProject = async (projectName) => {
    const url = `${FUNCTIONS}/initializeProject`;
    const payload = { projectName };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = projectName.trim();
    if (!trimmedName) return;

    if (INVALID_CHARS.test(trimmedName)) {
      setErrorMessage(
        "Project name cannot contain any of the following characters: . # $ [ ] /"
      );
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const result = await initializeProject(trimmedName);

      if (result.success) {
        navigate(`/home?project=${encodeURIComponent(trimmedName)}`);
      } else {
        setErrorMessage(result.error || "Failed to initialize project");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-container">
      <div className="form-card">
        <h1>Welcome!</h1>
        <p>Enter your Android project name to continue</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="e.g., MyCoolApp"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Initializing..." : "Continue"}
          </button>
        </form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
}

export default LandingPage;
