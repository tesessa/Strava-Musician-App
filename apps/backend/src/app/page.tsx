import { APP_CONFIG } from "@strava-musician-app/shared";
import type { PracticeSession } from "@strava-musician-app/shared";

// This is just a filler page. Once we get a few backend routes working,
// this page should show each of the API routes and how to use them.

export default function Home() {
  // Example usage of shared types
  const exampleSession: PracticeSession = {
    id: "1",
    userId: "user-1",
    instrument: "Piano",
    durationMinutes: 30,
    notes: "Practiced scales and a new piece",
    createdAt: new Date(),
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>{APP_CONFIG.appName} - Backend</h1>
      <p>Version: {APP_CONFIG.version}</p>
      <p style={{ marginTop: "1rem" }}>
        This is the Next.js backend running on port 3001.
      </p>
      <div style={{ marginTop: "2rem" }}>
        <h2>Example Practice Session</h2>
        <pre
          style={{
            background: "#f5f5f5",
            padding: "1rem",
            borderRadius: "4px",
            marginTop: "0.5rem",
          }}
        >
          {JSON.stringify(exampleSession, null, 2)}
        </pre>
      </div>
    </main>
  );
}
