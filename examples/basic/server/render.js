import React from 'react';
import Layout from '../client/containers/Layout';

export default function render(req, res) {

  // Renders the client, and wraps it in the HTML layout
  let body = React.renderToString(<App/>);
  let client = React.renderToStaticMarkup(<Layout body={ body }/>);

  res.send(client);
}
