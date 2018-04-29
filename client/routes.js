import React from 'react';
import { Route, Switch } from 'react-router-dom';
import App from './components/App';
import Login from './components/Login';

export const Routes = () => (
  <Switch>
    <Route exact path='/' component={App} />
    <Route path='/login' component={Login} />
  </Switch>
);

export default Routes;
