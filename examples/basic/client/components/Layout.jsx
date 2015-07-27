import React from 'react';

export default class Layout extends React.Component {
  render() {
    let {body} = this.props;

    return (
      <html>
        <head>
          <title>Isomorphine Basic Example</title>
        </head>
        <body>
        <div id='app-container' dangerouslySetInnerHTML={{ __html: body }}/>
        </body>
      </html>
    );
  }
}
