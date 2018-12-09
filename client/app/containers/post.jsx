import React from 'react';
import { connect } from 'react-redux';
import { fetchPost, updatePost } from '../actions';
import Loading from '../components/loading.jsx';
import Edit from '../components/edit.jsx';
import Dialog from 'material-ui/Dialog';

class Post extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      dialogContent: '',
    };
    this.dialogTimeout = null;
  }

  componentDidMount() {
    const { params, dispatch } = this.props;
    const { id } = params;
    dispatch(fetchPost(id));
  }

  message(content) {
    if (this.dialogTimeout) {
      this.dialogTimeout = null;
      clearTimeout(this.dialogTimeout);
    }
    this.setState({ dialogOpen: true, dialogContent: content });
    this.dialogTimeout = setTimeout(() => {
      this.setState({ dialogOpen: false });
    }, 1000);
  }

  render() {
    const { isFetching, post, location, params, dispatch, history } = this.props;
    const { dialogOpen, dialogContent } = this.state;
    const { id } = params;
    const { pathname } = location;
    const isEdit = /edit$/.test(pathname);
    if (isFetching || !post.data) return <Loading />;

    return (
      <div>
        <Edit
          isEdit={isEdit}
          pathname={pathname}
          message={this.message.bind(this)}
          history={history}
          content={JSON.stringify(post.data, null, 4)}
          onSave={async (doc) => {
            const res = await updatePost(id, doc);
            if ([1, 2].includes(res.state)) this.message(res.message);
            if ([0, 1].includes(res.state)) {
              dispatch(fetchPost(id));
              history.replace(`/posts/${id}`);
            }
          }}
        />
        <Dialog
          open={dialogOpen}
          onRequestClose={() => {
            this.setState({ dialogOpen: false });
          }}
        >
          {dialogContent}
        </Dialog>
      </div>
    );
  }
}

export default connect(state => state)(Post);