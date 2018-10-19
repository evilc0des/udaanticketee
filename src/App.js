import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import axios from 'axios';

import Sidebar from './Components/Sidebar';
import Content from './Components/Content'

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      screens: [],
      contentState: null
    };

    this.setContentState = this.setContentState.bind(this);
    this.addScreen = this.addScreen.bind(this);
  }

  componentDidMount() {
    axios.get("/screens")
      .then(res => {
        if(res.status == 200){
          this.setState({
            isLoaded: true,
            screens: res.data.screens
          });
        }
      }).catch((error) => {
        this.setState({
          isLoaded: true,
          error
        });
      });
  }

  setContentState(state) {
    this.setState({
      contentState: state
    });
  }

  addScreen(screen) {
    this.setState({
      screens: [...this.state.screens, screen]
    })
  }

  render() {
    return (
      <div className="App">
        <Sidebar screens={this.state.screens}
          setContentState={this.setContentState}
        ></Sidebar>
        <Content addScreen={this.addScreen} contentState={this.state.contentState}></Content>
      </div>
    );
  }
}

export default App;
