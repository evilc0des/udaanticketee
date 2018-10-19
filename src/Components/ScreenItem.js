import React, { Component } from 'react';
import './ScreenList.css';

class ScreenItem extends Component {
    
  render() {
    let {screen} = this.props;
    return (
      <li className="screen-item">
        {screen}
      </li>
    );
  }
}

export default ScreenItem;