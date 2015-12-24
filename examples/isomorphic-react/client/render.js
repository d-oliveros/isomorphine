import React from 'react';
import App from './App.jsx';

let state = window.__STATE__;

/**
 * Renders the app in the container
 */
let container = document.getElementById('app-container');
React.render(<App state={ state }/>, container);
