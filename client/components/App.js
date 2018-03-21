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
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>
            Name:
            <input type="text" value={this.state.value} onChange={this.handleChange} />
          </label>
          <input type="submit" value="Submit" />
        </form>
        <ul>
          {this.state.tweets.map((tweet, i) =>
            <li key={i}>{tweet}</li>
          )}
        </ul>
      </div>
    );
  }
}

export default App;
