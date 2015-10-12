import React from 'react';
import { User } from '../api';
import Layout from '../client/Layout.jsx';
import App from '../client/App.jsx';

export default function render(req, res) {

  // Using the same API on server side
  User.create({ _id: 5, name: 'someone' }, (err, user) => {
    if (err) return res.status(500).json(err);

    let initialState = {
      user: user,
      post: null
    };

    // Renders the client, and wraps it in the HTML layout
    let app = <App state={ initialState }/>;
    let body = React.renderToString(app);
    let layout = <Layout body={ body } state={ initialState }/>;
    let client = React.renderToStaticMarkup(layout);

    res.send(client);
  });
}
