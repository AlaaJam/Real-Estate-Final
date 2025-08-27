import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import AdminRoute from "./routes/AdminRoute";

import {
  Home,
 
  Listings,
  Login,
  Signup,
  Forgot,
  Listing,
  Dashboard,
  UserProfile,
  Messages,
  // Password,
  AddLisiting,
  AdminListingList,
  AdminAgentsList,
  // ,
} from "./pages";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/listing" component={Listings} />

        <Route exact path="/property/:id" component={Listing} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/signup" component={Signup} />
        <Route exact path="/forgot-password" component={Forgot} />
      <AdminRoute exact path="/dashboard" component={Dashboard} />
        <Route exact path="/profile" component={UserProfile} />
        <Route exact path="/messages" component={Messages} />
        {/* <Route exact path="/change-password" component={Password} /> */}
        <Route path="/add-listing/:id?" component={AddLisiting} />
    
 <AdminRoute exact path="/all-listing" component={AdminListingList} />
 <AdminRoute exact path="/all-agents" component={AdminAgentsList} />



        {/* <Route exact path="/mylisting" component={AgentListing} /> */}
        
      </Switch>
    </Router>
  );
};

export default App;
