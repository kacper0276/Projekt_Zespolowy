import "./App.scss";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./layout/Layout";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from "../src/layout/Header/Header";
import Footer from "../src/layout/Footer/Footer";
import MainPage from "../src/pages/MainPage/MainPage";
import KanbanBoard from "./pages/KanbanBoard/KanbanBoard";
import LoginPage from "./pages/LoginPage/LoginPage";
import NotFound from "./pages/NotFound/NotFound";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import Sidebar from "./layout/Sidebar/Sidebar";
import Settings from "./pages/Settings/Settings";
import { UserProvider } from "./context/UserContext";
import ActivateAccount from "./pages/ActivateAccount/ActivateAccount";
import BoardsNew from "./pages/BoardsNew/BoardsNew";
import AuthenticatedRoute from "./hoc/AuthenticatedRoute";
import TeamPage from "./pages/TeamPage/TeamPage";
import { AssignedUsersProvider } from "./layout/AssignedUserProvider";

function App() {
  const content = (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/KanbanBoard" element={<KanbanBoard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<RegisterPage />} />
      <Route
        path="/activate-account/:userEmail"
        element={<ActivateAccount />}
      />
      <Route
        path="/boards/new"
        element={
          <AuthenticatedRoute>
            <BoardsNew />
          </AuthenticatedRoute>
        }
      />
      <Route path="/boards/:id" element={<KanbanBoard />} />
      <Route
        path="/settings"
        element={
          <AuthenticatedRoute>
            <Settings />
          </AuthenticatedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <AuthenticatedRoute>
            <ProfilePage />
          </AuthenticatedRoute>
        }
      />
      <Route
        path="/my-teams"
        element={
          <AuthenticatedRoute>
            <TeamPage />
          </AuthenticatedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  const header = (
    <Routes>
      <Route path="/login" element={<></>} />
      <Route path="/signup" element={<></>} />
      <Route path="/activate-account/:userEmail" element={<></>} />
      <Route path="*" element={<Header />} />
    </Routes>
  );

  const sidebar = (
    <Routes>
      <Route path="/boards/:id" element={<Sidebar />} />
      <Route path="/boards/new" element={<></>} />
      <Route path="*" element={<></>} />
    </Routes>
  );

  const footer = (
    <Routes>
      <Route path="/profile" element={<></>} />
      <Route path="/login" element={<></>} />
      <Route path="/signup" element={<></>} />
      <Route path="/KanbanBoard" element={<></>} />
      <Route path="/activate-account/:userEmail" element={<></>} />
      <Route path="/boards/:id" element={<></>} />
      <Route path="*" element={<Footer />} />
    </Routes>
  );

  // Updated part in App.tsx
  return (
    <Router>
      <UserProvider>
        <AssignedUsersProvider>
          <Layout
            header={header}
            content={content}
            sidebar={sidebar}
            footer={footer}
          />
        </AssignedUsersProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
