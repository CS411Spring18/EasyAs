import React, { Component } from 'react';
import '../css/App.css';
import axios from 'axios';
var querystring = require('querystring');
var BarChart = require("react-chartjs").Bar;
var Modal = require('react-bootstrap').Modal;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      tweets: [],
      resultsShow: false,
      personality: [],  //
      twitterName: '', // temp twitter name
      done: false,
      matches: [],
      username: '',

    };
  }

  componentWillMount() {
    axios.post('/fetchUser',
      querystring.stringify({
        name: new URL(window.location.href).searchParams.get("user").toLowerCase(),
      }), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }).then((response) => {
        this.setState({
          username: response.data.name,
          personality: response.data.personality,
          matches: response.data.matches,
          resultsShow: true,
          done: true,
        });
        console.log(this.state);
      });
  }

  render() {
    return (
      <div>
        <div>
          <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
            <a className="navbar-brand" href="#">Little Birdie</a>
          </nav>
        </div>

        <main role="main" className="container" style={{paddingTop:75}}>
          <div className="starter-template text-center">
            <h1>Welcome, {this.state.username}. </h1>
            <p className="lead">Here are the results of your personality analysis :</p>
          </div>

          {this.state.done ? <Chart openness={this.state.personality[0].percentile} conscientiousness={this.state.personality[1].percentile} ext={this.state.personality[2].percentile} agree={this.state.personality[3].percentile} emo={this.state.personality[4].percentile}/> : null}
          {/*<button className="btn btn-lg btn-primary btn-block" type="submit" onClick={this.handleSubmit.bind(this)}>Find Your Top 5 Matches</button>*/}
          <hr/>

          {this.state.done ? <Results data={this.state.matches} /> : null}
        </main>
      </div>
    );
  }
}

class Chart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      tweets: [],
      resultsShow: false,
      personality: [props.openness*100,props.conscientiousness*100, props.ext*100, props.agree*100,props.emo*100],  //
    };
  }
  render() {

    var chartInfo = {
      chartData: {labels: ["Openness", "Conscientiousness", "Extroversion", "Agreeableness", "Emotional Range"],
        datasets: [
          {
            label: "Percentile",
            backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
            data: this.state.personality
          }
        ]
      },
      chartOptions: {scales: {
        yAxes: [{
          barPercentage: 0.5,
          gridLines: {
            display: false
          }
        }],
        xAxes: [{
          gridLines: {
            zeroLineColor: "black",
            zeroLineWidth: 2
          },
          ticks: {
            min: 0,
            max: 100,
            stepSize: 10
          },
          scaleLabel: {
            display: true,
            labelString: "Percentile"
          }
        }]
      },
        elements: {
          rectangle: {
            borderSkipped: 'left',
          }
        }
      }
    };

    return (
      <BarChart data={chartInfo.chartData} options={chartInfo.chartOptions}  width="600" height="250" />
    );
  }
}


class Results extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      tweets: [],
      resultsShow: false,
      personality: [props.data[0].similarity*100, props.data[1].similarity*100, props.data[2].similarity*100, props.data[3].similarity*100, props.data[4].similarity*100],
      names: [props.data[0].username, props.data[1].username, props.data[2].username, props.data[3].username, props.data[4].username],
    };

    this.onClickFunction = this.onClickFunction.bind(this);

  }

  onClickFunction(event) {
    let activeBars = this.refs.charts1.getBarsAtEvent(event);
    let userLabel = activeBars[ 0 ].label;
    const url = "https://twitter.com/" + userLabel;
    window.open(url);
  };  

  render() {
    console.log(this.props.data);

    var chartInfo = {
      chartData: {labels: this.state.names,
        datasets: [
          {
            label: "Percentile",
            backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
            data: this.state.personality
          }
        ]
      },
      chartOptions: {
        scales: {
        yAxes: [{
          barPercentage: 0.5,
          gridLines: {
            display: false
          }
        }],
        xAxes: [{
          gridLines: {
            zeroLineColor: "black",
            zeroLineWidth: 2
          },
          ticks: {
            min: 0,
            max: 100,
            stepSize: 10
          },
          scaleLabel: {
            display: true,
            labelString: "Percentile"
          }
        }]
      },
        elements: {
          rectangle: {
            borderSkipped: 'left',
          }
        },
      }
    };
    return (
      <div id="results">
        <h1 >Results</h1>
        <p className="lead">Here are your most similar followers:</p>
        <BarChart ref="charts1" data={chartInfo.chartData} options={chartInfo.chartOptions} onClick={this.onClickFunction} width="600" height="250" />
      </div>

    );
  }
}
export default App;
