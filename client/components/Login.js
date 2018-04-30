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
        <main role="main" className="container">

          <div className="text-center" style={{paddingTop: 20}}>
            <form className="form-signin">
              <h1 className="h3 mb-3 font-weight-normal">Please Sign In</h1>

              <button className="btn btn-lg btn-primary btn-block" type="button" onClick={this.handleClick}>Twitter Login</button>
            </form>
          </div>
        </main>
      </div>
    );
  }
}

export default Login;
