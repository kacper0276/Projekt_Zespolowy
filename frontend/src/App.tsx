import "./App.scss";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./layout/Layout";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function App() {
  const header = <h1>Header</h1>;

  const content = (
    <Routes>
      <Route path="/" element={<h1>Main Page</h1>} />
    </Routes>
  );

  const footer = <h1>Footer</h1>;

  return (
    <Router>
      <Layout header={header} content={content} footer={footer} />
    </Router>
  );
}

export default App;
