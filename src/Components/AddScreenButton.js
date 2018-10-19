import React, { Component } from 'react';
import './Sidebar.css';

class AddScreenButton extends Component {
  render() {
    return (
      <button className="add-screen-button" onClick={e => this.props.handleClick("addScreen")}>
        Add New Screen
      </button>
    );
  }
}

export default AddScreenButton;