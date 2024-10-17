import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import RegisterPage from "../pages/RegisterPage";
import CheckEmailPage from "../pages/CheckEmailPage";
import CheckPasswordPage from "../pages/CheckPasswordPage";
import Home from "../pages/Home";
import MessagePage from "../components/MessagePage";
import AuthLayouts from "../layout";
import Forgotpassword from "../pages/Forgotpassword";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "register",
                element: <AuthLayouts><RegisterPage /></AuthLayouts>
            },
            {
                path: 'email',
                element: <AuthLayouts><CheckEmailPage /></AuthLayouts>
            },
            {
                path: 'password',
                element: <AuthLayouts><CheckPasswordPage /></AuthLayouts>
            },
            {
                path: 'forgot-password',
                element: <AuthLayouts><Forgotpassword /></AuthLayouts>
            },
            {
                // Route for both "/" and "/home" pointing to Home component
                path: "/",
                element: <Home />,
                children: [
                    {
                        path: ':userId',
                        element: <MessagePage />
                    }
                ]
            },
            {
                // Additional route for "/home" also pointing to Home component
                path: "home",
                element: <Home />,
                children: [
                    {
                        path: ':userId',
                        element: <MessagePage />
                    }
                ]
            }
        ]
    }
]);

export default router;
