import React, { Component } from 'react';
import '../css/App.css';
// import axios from 'axios';
var querystring = require('querystring');


class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      tweets: [],
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }
  console.log('helllo');
  render() {
    return (
      <div>
        {/*<main role="main" className="container">*/}
          {/*<h1>Hello</h1>*/}
        {/*</main>*/}





        <main role="main" className="container">
          <div className="jumbotron">
            <h1>Twitter Username:</h1>
            <form className="form-inline" onSubmit={this.handleSubmit}>
              <input className="form-control" aria-label="Username" onChange={this.handleChange}></input>
              <button className="btn btn-lg btn-primary" display="inline">Search</button>
            </form>
          </div>
          <div className="jumbotron">
            <h1>Results:</h1>
            <div className="table-responsive">
              <table className="table">
                <tbody>
                {this.state.tweets.map((tweet, i) =>
                  <tr key={i}>
                    <td>{tweet}</td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default Login;