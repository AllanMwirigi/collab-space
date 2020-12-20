import React,{ useState, useEffect } from "react";

export default function RoomEntry(props) {

  const [roomNameInp, setRoomNameInp] = useState("");
  // const [passwordInp, setPasswordInp] = useState("");
  const [requestPending, setRequestPending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if(roomNameInp.trim() === '' /* || passwordInp.trim() === '' */ ) {
      // alert('Fill in all fields');
      alert('Please enter Room Name');
      return;
    }
    setRequestPending(true);
    // TODO: show some fancy loading
    setTimeout(() => {
      setRequestPending(false);
    }, 500);
    
  }

  return(
    <div className="limiter">
      <div className="container-login100">
        <div className="wrap-login100">
          <form className="login100-form validate-form p-l-55 p-r-55 p-t-178" onSubmit={e => submit(e) }>
            <span className="login100-form-title">
              Enter Whiteboard Room Details
            </span>

            <div className="wrap-input100 validate-input m-b-16" data-validate="Please enter room name">
              <input className="input100" type="text" name="room-name" placeholder="Room Name" 
                value={roomNameInp} onChange={(e) => { 
                  if (e.code !== 'Space') {
                    setRoomNameInp(e.currentTarget.value.trim()) 
                  }
                } }
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