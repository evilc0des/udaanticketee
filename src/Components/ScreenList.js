import React, { Component } from 'react';
import '../App.css';

import ScreenItem from './ScreenItem';


class ScreenList extends Component {
  render() {

    let { screens } = this.props;

    return (
      <ul className="screen-list">
        {
            screens.map(screen => <ScreenItem key={screen} screen={screen}></ScreenItem>)
        } 
      </ul>
    );
  }
}

export default ScreenList;