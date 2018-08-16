import React, { Component } from 'react';
import './App.css';
import ChloroBubble from './chloro-bubble';

class App extends Component {
  render() {
    return (
      <div className="App">
        <svg width="960" height="600">
          <ChloroBubble width={960} height={600} />
        </svg>

      </div>
    );
  }
}

export default App;
