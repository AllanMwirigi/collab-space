import React,{ useState, } from "react";
import { ToastContainer } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import 'react-toastify/dist/ReactToastify.css';
import Credentials from './pages/Credentials';
import Workspace from './pages/Workspace';
import './App.css';

function App() {

  const [verified, setVerified] = useState(false);

  const exitWorkspace = () => {
    // TODO: have a dialog or sth
    setVerified(false);
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>Collab Space</p>
        { verified && <div className="room-details-cont">
          <div className="room-details">
            <span>Room Name: {sessionStorage.getItem('roomName')}</span> 
            <span>UserName: {sessionStorage.getItem('displayName')}</span>
          </div>
          <i className="fas fa-times-circle exit-room-icon" data-tip="Exit Workspace" onClick={() => exitWorkspace()}></i> 
          <ReactTooltip place="left" type="error" effect="float"/>
        </div> }
      </header>
      { !verified && <Credentials setVerified={setVerified}/> }
      { verified &&  <Workspace/> }
      <ToastContainer />
    </div>
  );
}

export default App;
