import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';

import Signup from './auth/Signup';
import Login from './auth/Login';
import Dashboard from './Dashboard';
import ForgotPassword from './auth/ForgotPassword';
import UpdateProfile from './auth/UpdateProfile';
import PrivateRoute from './common/PrivateRoute';
import { AuthProvider } from '../context/AuthContext';
import { FunctionsProvider } from '../context/FunctionsContext';
import { DatabaseProvider } from '../context/DatabaseContext';
import CurrentGame from './bingo/CurrentGame';
import CallingGame from './bingo/CallingGame';

function App() {
  return (
    <Container
      className="d-flex flex-row align-items-center justify-content-center mx-5 w-100 border"
      style={{ minHeight: '100vh' }}
    >
      <div className="w-100 mx-3">
        <Router>
          <AuthProvider>
            <DatabaseProvider>
              <FunctionsProvider>
                <Switch>
                  <PrivateRoute exact path="/" component={Dashboard} />
                  <PrivateRoute
                    path="/update-profile"
                    component={UpdateProfile}
                  />
                  <PrivateRoute path="/join-game" component={CurrentGame} />
                  <PrivateRoute path="/call-game" component={CallingGame} />
                  <Route path="/signup" component={Signup} />
                  <Route path="/login" component={Login} />
                  <Route path="/forgot-password" component={ForgotPassword} />
                </Switch>
              </FunctionsProvider>
            </DatabaseProvider>
          </AuthProvider>
        </Router>
      </div>
    </Container>
  );
}

export default App;
