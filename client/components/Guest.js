import React, { Component } from 'react';
import '../css/App.css';
import axios from 'axios';
var querystring = require('querystring');
var BarChart = require("react-chartjs").Bar;
var Modal = require('react-bootstrap').Modal;

class Guest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      tweets: [],
      resultsShow: false,
      personality: [],  //
      done: false,
      username: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit() {
    axios.post('/fetchUserPersonality',
      querystring.stringify({
        name: this.state.value,
      }), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }).then((response) => {
        this.setState({
          username: response.data.name,
          personality: response.data.personality,
          resultsShow: true,
          done: true,
        });
      });
  }

  render() {
    return (
      <div>
        <div>
          <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
            <a className="navbar-brand" href="/#/login">Little Birdie</a>
          </nav>
        </div>

        <main role="main" className="container" style={{paddingTop:75}}>
          <div className="starter-template text-center">
            <h1 className="h2 mb-3 font-weight-normal">Welcome, Guest. </h1>
            <div className="jumbotron">
              <form className="form-inline" onSubmit={this.handleSubmit}>
                <h3 className="h2 mb-3 font-weight-normal">Twitter Username:</h3>

                <input className="form-control" aria-label="Username" onChange={this.handleChange}></input>
                <button className="btn btn-lg btn-primary" display="inline">Search</button>
              </form>
            </div>
            {this.state.done ? <p className="lead">Here are the results of your personality analysis : </p> : null}
          </div>

          {this.state.done ? <Chart openness={this.state.personality[0].percentile} conscientiousness={this.state.personality[1].percentile} ext={this.state.personality[2].percentile} agree={this.state.personality[3].percentile} emo={this.state.personality[4].percentile}/> : null}
          {/*<button className="btn btn-lg btn-primary btn-block" type="submit" onClick={this.handleSubmit.bind(this)}>Find Your Top 5 Matches</button>*/}
          <hr/>
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
            fillColor: [ "#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850" ],
            strokeColor: "rgba(220,220,220,0.8)",
            highlightFill: "rgba(220,220,220,0.75)",
            highlightStroke: "rgba(220,220,220,1)",
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
  }
  render() {
    console.log('hello');
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
    <div id="results">
      <h1 >Results</h1>
      <p className="lead">Here are your most similar followers:</p>
      <BarChart data={chartInfo.chartData} options={chartInfo.chartOptions} width="600" height="250"/>
    </div>

    )
  }
}
export default Guest;
