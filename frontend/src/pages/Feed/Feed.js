import React, { useState, useEffect, useCallback, Fragment } from 'react';
import openSocket from 'socket.io-client';

import Post from '../../components/Feed/Post/Post';
import Button from '../../components/Button/Button';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Input from '../../components/Form/Input/Input';
import Paginator from '../../components/Paginator/Paginator';
import Loader from '../../components/Loader/Loader';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import './Feed.css';

const paginationNumber = Number.MAX_SAFE_INTEGER;

const Feed = props => {

  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [editPost, setEditPost] = useState(null);
  const [status, setStatus] = useState('');
  const [postPage, setPostPage] = useState(1);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [newPost, setNewPost] = useState(false);
  const [caller, setCaller] = useState('feed');
  const [error, setError] = useState(null);

  const catchError = error => {
    setError(error);
  };

  const addPost = useCallback( (post) => {
    const updatedPosts = posts;
    let ttlPsts = totalPosts;
    if (postPage === 1) {
      if (posts.length >= paginationNumber) {
        updatedPosts.pop();
      }
      updatedPosts.unshift(post);
      ttlPsts = totalPosts + 1;
    }
    setPosts(updatedPosts);
    setPosts(ttlPsts);
  }, [postPage, posts, totalPosts]);

  const updatePost = useCallback( (post) => {
    const updatedPosts = posts;
    const updatedPostIndex = updatedPosts.findIndex(p => p._id === post._id);
    if (updatedPostIndex > -1) {
      updatedPosts[updatedPostIndex] = post;
    }
    setPosts(updatedPosts);
  }, [posts]);

  const loadPosts = useCallback( direction => {
    
    if (direction) {
      setPostsLoading(true);
      setPosts([]);
    }
    let page = postPage;
    if (direction === 'next') {
      page++;
      setPostPage(page);
    }
    if (direction === 'previous') {
      page--;
      setPostPage(page);
    }
    
    fetch('http://localhost:8080/feed/posts?page=' + page + '&userId=' + props.userId, {
      headers: {
        Authorization: 'Bearer ' + props.token
      }
    })
    .then(res => {
      if (res.status !== 200) {
        throw new Error('Failed to fetch posts.');
      }
      return res.json();
    })
    .then(resData => {
      console.log('123123!');
      const psts = resData.posts.map(post => {
        return {
          ...post,
          imagePath: post.imageUrl
        };
      })
      setPosts(psts);
      console.log(posts);
      setTotalPosts(resData.totalItems);
      setPostsLoading(false);
      // console.log('123123!');
    })
    .catch(err => {
      catchError(err);
    });
    
  }, [postPage, posts, props.token, props.userId]);

  useEffect( () => {
    // console.log(posts);
    fetch('http://localhost:8080/auth/status', {
      headers: {
        Authorization: 'Bearer ' + props.token
      }
    })
    .then(res => {
      if (res.status !== 200) {
        throw new Error('Failed to fetch user status.');
      }
      return res.json();
    })
    .then(resData => {
      setStatus(resData.status);
    })
    .catch(err => {
      catchError(err);
    });
    loadPosts();
    // console.log(posts);
    const socket = openSocket('http://localhost:8080');
    socket.on('posts', data => {
      if (data.action === 'create') {
        addPost(data.post);
      } else if (data.action === 'update') {
        updatePost(data.post);
      } else if (data.action === 'delete') {
        loadPosts();
      }
    });
  }, [loadPosts, addPost, props.token, updatePost]);

  const statusUpdateHandler = event => {
    event.preventDefault();
    fetch('http://localhost:8080/auth/status', {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer ' + props.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: status
      })
    })
    .then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Can't update status!");
      }
      return res.json();
    })
    .then(resData => {
      console.log(resData);
    })
    .catch(err => {
      catchError(err);
    });
  };

  const newPostHandler = () => {
    setIsEditing(true);
    setNewPost(true);
  };

  const startEditPostHandler = postId => {
    setIsEditing(true);
    const loadedPost = { ...posts.find(p => p._id === postId) };
    setEditPost(loadedPost);
    setNewPost(true);
  };

  const cancelEditHandler = () => {
    setIsEditing(false);
    setEditPost(null);
  };

  const finishEditHandler = postData => {
    setEditLoading(true);
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('image', postData.image);
    let url = 'http://localhost:8080/feed/post';
    let method = 'POST';
    if (editPost) {
      url = 'http://localhost:8080/feed/post/' + editPost._id;
      method = 'PUT';
    }

    fetch(url, {
      method: method,
      body: formData,
      headers: {
        Authorization: 'Bearer ' + props.token
      }
    })
    .then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Creating or editing a post failed!');
      }
      return res.json();
    })
    .then(resData => {
      console.log(resData);
      setIsEditing(false);
      setEditPost(null);
      setEditLoading(false);
    })
    .catch(err => {
      console.log(err);
      setIsEditing(false);
      setEditPost(null);
      setEditLoading(false);
      setError(err);
    });
  };

  const statusInputChangeHandler = (input, value) => {
    setStatus(value);
  };

  const deletePostHandler = postId => {
    setPostsLoading(true);
    fetch('http://localhost:8080/feed/post/' + postId, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + props.token
      }
    })
    .then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Deleting a post failed!');
      }
      return res.json();
    })
    .then(resData => {
      console.log(resData);
      loadPosts();
    })
    .catch(err => {
      console.log(err);
      setPostsLoading(false);
    });
  };

  const errorHandler = () => {
    setError(null);
  };

  return (
    <Fragment>
      <ErrorHandler error={error} onHandle={errorHandler} />
      <FeedEdit
        editing={isEditing}
        selectedPost={editPost}
        loading={editLoading}
        onCancelEdit={cancelEditHandler}
        onFinishEdit={finishEditHandler}
        newPost={newPost}
      />
      <section className="feed__status">
        <form onSubmit={statusUpdateHandler}>
          <Input
            type="text"
            placeholder="Your status"
            control="input"
            onChange={statusInputChangeHandler}
            value={status}
          />
          <Button mode="flat" type="submit">
            Update
          </Button>
        </form>
      </section>
      <section className="feed__control">
        <Button mode="raised" design="accent" onClick={newPostHandler} newPost={true}>
          New Post
        </Button>
      </section>
      <section className="feed">
        {postsLoading && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Loader />
          </div>
        )}
        {posts.length <= 0 && !postsLoading ? (
          <p style={{ textAlign: 'center' }}>No posts found.</p>
        ) : null}
        {!postsLoading && (
          <Paginator
            onPrevious={loadPosts('previous')}
            onNext={loadPosts('next')}
            lastPage={Math.ceil(totalPosts / paginationNumber)}
            currentPage={postPage}
          >
            {posts.map(post => (
              <Post
                key={post._id}
                id={post._id}
                token={props.token}
                author={post.creator.name}
                creator={post.creator}
                date={new Date(post.createdAt).toLocaleString()}
                title={post.title}
                image={post.imageUrl}
                content={post.content}
                caller={caller}
                onStartEdit={startEditPostHandler(post._id)}
                onDelete={deletePostHandler(post._id)}
                // onLike={this.likeHandler.bind(this, post._id)}
              />
            ))}
          </Paginator>
        )}
      </section>
    </Fragment>
  );
}

export default Feed;
