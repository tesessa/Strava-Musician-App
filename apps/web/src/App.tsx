// import { APP_CONFIG } from "@strava-musician-app/shared";
// import type { User } from "@strava-musician-app/shared";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from './pages/Login';

function App() {
    return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
  // return 
  // Example usage of shared types
  // const exampleUser: User = {
  //   id: "1",
  //   username: "musician",
  //   email: "musician@example.com",
  //   displayName: "Example Musician",
  //   createdAt: new Date(),
  // };

  // return (
  //   <div className="app">
  //     <header className="header">
  //       <h1>{APP_CONFIG.appName}</h1>
  //       <p className="version">v{APP_CONFIG.version}</p>
  //     </header>
  //     <main className="main">
  //       <p className="welcome">
  //         Welcome to {APP_CONFIG.appName}! Track your practice sessions and
  //         share your musical journey with others.
  //       </p>
  //       <p className="demo">
  //         Demo user: <strong>{exampleUser.displayName}</strong>
  //       </p>
  //     </main>
  //   </div>
  // );
}

export default App;
