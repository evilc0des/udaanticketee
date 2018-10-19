import React, { Component } from 'react';
import './Content.css';

import AddScreenForm from './AddScreenForm';

class Content extends Component {
  render() {

    let {contentState} = this.props;

    let content;
    switch(contentState){
        case 'addScreen':
            content = <AddScreenForm addScreen={this.addScreen}></AddScreenForm>;
            break;
        default:
            content = null;
    }

    return (
      <div className="App-Content">
        <a className="logout-btn" href="/auth/logout">LOGOUT</a>
        {
            content
        }
      </div>
    );
  }
}

export default Content;