import "./App.scss";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./layout/Layout";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from "../src/layout/Header/Header"
import Footer from "../src/layout/Footer/Footer"
import MainPage from "../src/pages/MainPage/MainPage"

function App() {

  const content = (
    <Routes>
      <Route path="/" element={<MainPage/>} />
    </Routes>
  );


  const header = (
    <>
      <Routes>
        <Route path="*" element={<Header/>} />
      </Routes>
    </>
  );

  const footer = (
    <>
      <Routes>
        <Route path="*" element={<Footer/>} />
      </Routes>
    </>
  );

  return (
    <Router>
      <Layout header={header} content={content} footer={footer} />
    </Router>
  );
}

export default App;
