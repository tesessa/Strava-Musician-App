// import { APP_CONFIG } from "@strava-musician-app/shared";
// import type { User } from "@strava-musician-app/shared";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import Home from './pages/Home';
import PracticePage from "./pages/record";
import Post from "./pages/Post"

function App() {
    return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/record" element={<PracticePage/>} />
        <Route path="/calendar" element={<div style={{ padding: 24 }}>Calendar (TBD)</div>} />
        <Route path="/profile" element={<div style={{ padding: 24 }}>Profile / Settings (TBD)</div>} />
        <Route path="/post" element={<Post/>} />
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
