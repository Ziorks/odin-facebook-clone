import App from "../App";
import Error from "../pages/Error";
import Home from "../pages/Home";
import Oauth from "../pages/Oauth";
import Friends from "../pages/Friends";
import UserProfile from "../pages/UserProfile";
import UserSearch from "../pages/UserSearch/UserSearch";

const routes = [
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "friends",
        element: <Friends />,
      },
      {
        path: "users",
        children: [
          {
            index: true,
            element: <UserSearch />,
          },
          {
            path: ":userId",
            element: <UserProfile />,
          },
        ],
      },
    ],
  },
  {
    path: "/oauth",
    element: <Oauth />,
  },
];

export default routes;
