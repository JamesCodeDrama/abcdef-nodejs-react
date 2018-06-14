import React, { Component } from 'react';

//import Post from '../../components/Post/Post';
import PostTable from '../../components/PostTable/PostTable';
import FullPost from '../../components/FullPost/FullPost';
import NewPost from '../../components/NewPost/NewPost';
import './Blog.css';

class Blog extends Component {
    state = {
        posts: [],
        fromServer: "",        
        selectedPostId: null
    }

    componentDidMount () {
        this.callApi()
        .then(res =>{ 
            this.setState({ posts: res.express })
            //console.log(res.express);
        })
        .catch(err => console.log(err));
        // axios.get('https://api.coinmarketcap.com/v2/ticker/?structure=array')
        //     .then( response => {
        //         const posts = response.data.data.slice(0, 4);
        //         const updatedPosts = posts.map(post => {
        //             return {
        //                 ...post,
        //                 author: 'Max'
        //             }
        //         });
        //         this.setState({posts: updatedPosts});
        //         // console.log( response );
        //     } );
    }

    callApi = async () => {
        const response = await fetch('/api/hello');
        const body = await response.json();
    
        if (response.status !== 200) throw Error(body.message);
    
        return body;
    };
    postSelectedHandler = (id) => {
        this.setState({selectedPostId: id});
    }

    addFeed = (id) => {
        this.setState({selectedPostId: id});
    }
    render () {
        // const posts = this.state.posts.map(post => {
        //     return <Post 
        //         key={post.id} 
        //         title={post.name} 
        //         author={post.quotes.USD.price}
        //         clicked={() => this.postSelectedHandler(post.id)} />;
        // });

        return (
            <div className='Blog'>
                <header>
                    <nav>
                        <ul>
                            <li><a href='/'>Home</a></li>
                            <li><a href='/about'>About Us</a></li>
                        </ul>
                    </nav>
                </header>
                <section className="Posts">
                    <FullPost id={this.state.selectedPostId} />
                    <PostTable 
                        arr={this.state.posts}
                        clicked={this.addFeed}
                    />
                </section>                
                {/* <section className="Posts">
                    {posts}
                </section> */}

                {/* <section>
                    <NewPost />
                </section> */}
            </div>
        );
    }
}

export default Blog;