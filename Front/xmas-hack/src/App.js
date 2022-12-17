import './styles/styles.scss';
import Work from './Compotents/Work';
import ErrorFeedBack from "./Compotents/ErrorFeedback"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DocsInfo from './Compotents/Body/DocsInfo';
import Header from "./Compotents/Header/Header";

function App() {
  return (
    <div>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Work />} exact />
          <Route path="/ErrorFeedBack" element={<ErrorFeedBack />} exact />
          <Route path='/DocsInfo' element={<DocsInfo />} exact />
        </Routes>
      </Router>
    </div>
  );
}

export default App



