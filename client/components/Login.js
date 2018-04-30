import React, { Component } from 'react';
import '../css/App.css';
import axios from 'axios';
import { withRouter, Redirect } from "react-router-dom";
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      tweets: [],
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }
  
  handleClick(event) {
    axios.get('/home')
      .then(function (response) {
        const url = "https://twitter.com/oauth/authorize?oauth_token=" + response.data;
        window.location = url;
      });
  };

  render() {
    return (
      <div>
        <div>
          <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
            <a className="navbar-brand" href="#">Little Birdie</a>
          </nav>
        </div>
        
        <main role="main" className="container">
          
          <div className="text-center" style={{paddingTop: 80}}>
            <form className="form-signin">
              <h1 className="h2 mb-3 font-weight-normal">Welcome to Little Birdie</h1>

              <button className="btn btn-lg btn-primary" type="button" onClick={this.handleClick}>Twitter Login</button>
            </form>
          </div>
        </main>
      </div>
    );
  }
}

export default Login;
