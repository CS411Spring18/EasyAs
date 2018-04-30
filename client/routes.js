import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Result from './components/Result';
import Login from './components/Login';

export const Routes = () => (
  <Switch>
    <Route exact path='/' component={Login} />
    <Route path='/results' component={Result} />
  </Switch>
);

export default Routes;
