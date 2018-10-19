import React, { Component } from 'react';
import './Sidebar.css';

import AddScreenButton from './AddScreenButton';
import ScreenList from './ScreenList';

class Sidebar extends Component {
  render() {
    return (
      <div className="App-Sidebar">
        <h1>Available Screens</h1>
        <ScreenList screens={this.props.screens}></ScreenList>

        <AddScreenButton handleClick={this.props.setContentState}></AddScreenButton>        
      </div>
    );
  }
}

export default Sidebar;