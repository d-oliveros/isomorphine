import React from 'react';

export default class Layout extends React.Component {
  render() {
    let { body, state } = this.props;

    state = JSON.stringify(state);

    return (
      <html>
        <head>
          <title>Isomorphine Basic Example</title>
          <script dangerouslySetInnerHTML={{ __html: `window.__STATE__ = ${state};` }}/>
        </head>
        <body>
          <div id='app-container' dangerouslySetInnerHTML={{ __html: body }}/>
          <script src='http://localhost:8001/build/bundle.js'/>
        </body>
      </html>
    );
  }
}
