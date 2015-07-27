import React from 'react';
import {User} from '../api';
import Layout from '../client/components/Layout';
import App from '../client/components/App';

export default function render(req, res) {

  // Using the same API on server side
  User.create({ _id: 5, name: 'someone' }, (err, user) => {
    if (err) return res.status(500).json(err);

    let initialState = {
      user: user,
      post: null
    };

    // Renders the client, and wraps it in the HTML layout
    let body = React.renderToString(<App state={ initialState }/>);
    let client = React.renderToStaticMarkup(<Layout body={ body } state={ initialState }/>);

    res.send(client);
  });
}
