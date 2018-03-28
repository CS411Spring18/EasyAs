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
        const tweets = response.data.map((tweet) => tweet.text);
        this.setState({
          tweets: tweets,
        });
      });
    event.preventDefault();
  }

  render() {
    console.log(this.state.tweets);
    return (
      <div>
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
                {this.state.tweets.map((tweet, i) =>
                  <tr>
                    <td key={i}>{tweet}</td>
                  </tr>
                )}
              </table>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App;
