import React,{ useState, } from "react";
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Credentials from './pages/Credentials';
import Workspace from './pages/Workspace';

function App() {

  const [verified, setVerified] = useState(false);

  return (
    <div className="App">
      <header className="App-header">
        <p>Collab Space</p>
      </header>
      { !verified && <Credentials setVerified={setVerified}/> }
      { verified &&  <Workspace/> }
      <ToastContainer />
    </div>
  );
}

export default App;
