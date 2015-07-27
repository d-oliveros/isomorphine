import React from 'react';
import {User, Post} from '../../api';

export default class App extends React.Component {
  constructor() {
    this.state = {
      user: null,
      post: null
    };

    this.createPost();
    this.loadUser();
  }

  createPost() {
    let newPost = {
      title: randomTitle(),
      body: 'This post was created from the browser.'
    };

    console.log(`Calling isomorphic method: Post.create`);

    Post.create(newPost, (err, post) => {
      if (err) return console.error(err);
      this.setState({ post });
    });
  }

  loadUser() {
    console.log('Calling isomorphic method: User.load');

    User.load({ _id: 3 }, { select: ['name'] }, (err, user) => {
      if (err) return console.error(err);

      if (user) {
        console.log(`User found: ${user.name}`);
        return this.setState({ user });
      }

      else {
        console.log(`User not found. Creating a new user.`);
        console.log('Calling isomorphic method: User.create');

        User.create({ _id: 3, name: 'somename' }, (err, user) => {
          if (err) return console.error(err);

          console.log(`User found: ${user.name}`);
          this.setState({ user });
        });
      }
    });
  }

  render() {
    let {user, post} = this.state;

    return (
      <div>
        <h1>Isomorphine example.</h1>
        { !user ? null : <p>User is loaded.</p> }
        { !post
          ? <p>No post loaded yet.</p>
          : (
            <article>
              <h3>{ post.title }</h3>
              <p>{ post.body }</p>
            </article>
          )
        }
      </div>
    );
  }
}

function randomTitle() {
  return `Morphine #${Date.now()}`;
}
