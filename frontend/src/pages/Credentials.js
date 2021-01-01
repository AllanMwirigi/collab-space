import React,{ useState } from "react";
import { toast } from 'react-toastify';
// import '../App.css';

export default function Credentials(props) {

  const [roomNameInp, setRoomNameInp] = useState("");
  const [displayNameInp, setDisplayNameInp] = useState("");
  // const [passwordInp, setPasswordInp] = useState("");
  const [requestPending, setRequestPending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if(roomNameInp.trim() === '' || displayNameInp.trim() === '' /* || passwordInp.trim() === '' */ ) {
      toast.error('Kindly fill in all fields');
      // alert('Please enter Room Name');
      return;
    }
    setRequestPending(true);
    // TODO: send request to backend and create/verify room
    // TODO: show some fancy loading
    setTimeout(() => {
      sessionStorage.setItem('roomName', roomNameInp);
      sessionStorage.setItem('displayName', displayNameInp);
      setRequestPending(false);
      props.setVerified(true); // have parent (App.js) change to the next page
    }, 500);
  }

  return(
    <div className="limiter">
      <div className="container-login100">
        <div className="wrap-login100">
          <form className="login100-form validate-form p-l-55 p-r-55 p-t-178" onSubmit={e => submit(e) }>
            <span className="login100-form-title">
              Space Details
            </span>

            <div className="wrap-input100 validate-input m-b-16" data-validate="Please enter room name">
              <input className="input100" type="text" name="room-name" placeholder="Room Name" 
                value={roomNameInp} onChange={(e) => { setRoomNameInp(e.currentTarget.value.trim()) } }
              />
              <span className="focus-input100"></span>
            </div>
            <div className="wrap-input100 validate-input m-b-16" data-validate="Please enter display name">
              <input className="input100" type="text" name="display-name" placeholder="Your Display Name" 
                value={displayNameInp} onChange={(e) => { setDisplayNameInp(e.currentTarget.value.trim()) } }
              />
              <span className="focus-input100"></span>
            </div>

            {/* <div className="wrap-input100 validate-input" data-validate = "Please enter password">
              <input className="input100" type="password" name="pass" placeholder="Password"
                value={passwordInp} onChange={(e) => setPasswordInp(e.currentTarget.value) }/>
              <span className="focus-input100"></span>
            </div> */}
            <div className="container-login100-form-btn">
              { !requestPending && <button className="login100-form-btn">
                Proceed
              </button> }
              { requestPending && <span className="txt3">Please wait...</span> }
            </div> 
          </form>
        </div>
      </div>
    </div>
  );
}