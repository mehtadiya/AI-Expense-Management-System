import { Outlet } from "react-router-dom";

function LoginLayout(){
    return(
        <>
        <div className="container-fluid">
            <div className="row">
                
               <Outlet/>
            </div>
        </div>
        </>
    )
}
export default LoginLayout;