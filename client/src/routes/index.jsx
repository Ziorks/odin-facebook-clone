import App from "../App";
import Error from "../pages/Error";
import Home from "../pages/Home";
import Oauth from "../pages/Oauth";
import Friends from "../pages/Friends";
import UserSearch from "../pages/UserSearch/UserSearch";
import UserProfile from "../pages/UserProfile";
import Wall from "../components/Wall";
import AboutLayout from "../pages/AboutLayout";
import AboutOverview from "../components/AboutOverview";
import AboutWorkAndEducation from "../components/AboutWorkAndEducation";
import AboutPlacesLived from "../components/AboutPlacesLived";

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
            children: [
              { index: true, element: <Wall /> },
              {
                element: <AboutLayout />,
                children: [
                  { path: "about", element: <AboutOverview /> },
                  { path: "about_overview", element: <AboutOverview /> },
                  {
                    path: "about_work_and_education",
                    element: <AboutWorkAndEducation />,
                  },
                  {
                    path: "about_places_lived",
                    element: <AboutPlacesLived />,
                  },
                ],
              },
            ],
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
