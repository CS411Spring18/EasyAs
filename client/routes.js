import React from 'react';
import { Route, Switch } from 'react-router-dom';
import App from './components/App';
import Login from './components/Login';
import Guest from './components/Guest';

export const Routes = () => (
  <Switch>
    <Route exact path='/' component={App} />
    <Route path='/login' component={Login} />
    <Route path='/guest' component={Guest} />
  </Switch>
);

export default Routes;
