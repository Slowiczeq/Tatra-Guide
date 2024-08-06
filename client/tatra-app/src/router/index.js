import { createRouter, createWebHistory } from "vue-router";
import Home from "../Pages/Home/Home.vue";
import Discover from "../Pages/Discover/Discover.vue";
import DiscoverForChild from "../Pages/Discover/DiscoverForChild.vue";
import DiscoverForBeginner from "../Pages/Discover/DiscoverForBeginner.vue";
import DiscoverForAdvanced from "../Pages/Discover/DiscoverForAdvanced.vue";
import DiscoverForDisabled from "../Pages/Discover/DiscoverForDisabled.vue";
import Route from "../Pages/Discover/Route.vue";
import Routes from "../Pages/Routes/Routes.vue";
import Challenges from "../Pages/Challenges/Challenges.vue";
import Blog from "../Pages/Blog/Blog.vue";
import Forum from "../Pages/Forum/Forum.vue";
import User from "../Pages/User/User.vue";
import Reviews from "../Pages/User/Partials/Reviews.vue";
import UserChallenges from "../Pages/User/Partials/Challenges.vue";
import RoutesHistory from "../Pages/User/Partials/RoutesHistory.vue";
import UserTrips from "../Pages/User/Partials/Trips.vue";
import EditTrip from "../Pages/Trip/Partials/Edit.vue";
import Trip from "../Pages/Trip/Trip.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/user/reviews",
      name: "user-reviews",
      component: Reviews,
    },
    {
      path: "/user/challenges",
      name: "user-challenges",
      component: UserChallenges,
    },
    {
      path: "/user/history",
      name: "user-history",
      component: RoutesHistory,
    },
    {
      path: "/user/trips",
      name: "user-trips",
      component: UserTrips,
    },
    {
      path: "/user/trips/:id",
      name: "user-trips-edit",
      component: EditTrip,
    },

    {
      path: "/discover",
      name: "discover",
      component: Discover,
    },
    {
      path: "/discover/for-child",
      name: "discover-for-child",
      component: DiscoverForChild,
    },
    {
      path: "/discover/for-beginner",
      name: "discover-for-beginner",
      component: DiscoverForBeginner,
    },
    {
      path: "/discover/for-advanced",
      name: "discover-for-advanced",
      component: DiscoverForAdvanced,
    },
    {
      path: "/discover/for-disabled",
      name: "discover-for-disabled",
      component: DiscoverForDisabled,
    },
    {
      path: "/route/:id",
      name: "route",
      component: Route,
    },
    {
      path: "/routes",
      name: "routes",
      component: Routes,
    },
    {
      path: "/challenges",
      name: "challenges",
      component: Challenges,
    },
    {
      path: "/blog",
      name: "blog",
      component: Blog,
    },
    {
      path: "/forum",
      name: "forum",
      component: Forum,
    },
    {
      path: "/user",
      name: "user",
      component: User,
    },
    {
      path: "/trip",
      name: "trip",
      component: Trip,
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  },
});

export default router;
