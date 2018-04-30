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
      personality: [],
      matches: [],
      username: '',
      resultsShow: false,
      chartData: {labels: ["Openness", "Neuroticsm", "Extroversion", "Conscienciousness", "Agreeableness"],
                  datasets: [
                    {
                      label: "Percentile",
                      backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
                      data: [80,50,64,81,80]
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
                  },
    };
  }



  componentWillMount() {
    axios.post('/fetchUser',
      querystring.stringify({
        name: 'jacobkozol',
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
        });
      });
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

          <BarChart data={this.state.chartData} options={this.state.chartOptions} width="600" height="250" style={{}}/>

          <hr/>

          {this.state.resultsShow ? <Results /> : null}




          {/*<div className="jumbotron">*/}
            {/*<h1>Twitter Username:</h1>*/}
            {/*<form className="form-inline" onSubmit={this.handleSubmit}>*/}
              {/*<input className="form-control" aria-label="Username" onChange={this.handleChange}></input>*/}
              {/*<button className="btn btn-lg btn-primary" display="inline">Search</button>*/}
            {/*</form>*/}
          {/*</div>*/}
          {/*<div className="jumbotron">*/}
            {/*<h1>Results:</h1>*/}
            {/*<div className="table-responsive">*/}
              {/*<table className="table">*/}
                {/*<tbody>*/}
                  {/*{this.state.tweets.map((tweet, i) =>*/}
                    {/*<tr key={i}>*/}
                      {/*<td>{tweet}</td>*/}
                    {/*</tr>*/}
                  {/*)}*/}
                {/*</tbody>*/}
              {/*</table>*/}
            {/*</div>*/}
          {/*</div>*/}
        </main>
      </div>
    );
  }
}

const data = {
  chartData: {labels: ["Openness", "Neuroticsm", "Extroversion", "Conscienciousness", "Agreeableness"],
    datasets: [
      {
        label: "Percentile",
        backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
        data: [80,50,64,81,80]
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

const Results = () => (
  <div id="results">
    <h1 >Results</h1>
    <p className="lead">Here are your most similar followers:</p>
    <BarChart data={data.chartData} options={data.chartOptions} width="600" height="250" style={{}}/>
  </div>
)

export default App;
