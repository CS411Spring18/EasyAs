import React, { Component } from 'react';
import '../css/App.css';
import axios from 'axios';
var querystring = require('querystring');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      tweets: [],
      personality: [],
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    axios.post('/fetchUser',
      querystring.stringify({
        name: this.state.value,
      }), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }).then((response) => {
        this.setState({
          personality: response.data,
        });
      });
    event.preventDefault();
  }

  render() {
    console.log(this.state);
    return (
      <div>
        <div>
          <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
            <a className="navbar-brand" href="#">Little Birdie</a>
          </nav>
        </div>

        <main role="main" className="container" style={{paddingTop:75}}>
          <div className="starter-template text-center">
            <h1>Welcome, _ . </h1>
            <p className="lead">Here are the results of your personality analysis :</p>
          </div>
          <button className="btn btn-lg btn-primary btn-block" type="submit">Find Your Top 5 Matches</button>



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

export default App;
