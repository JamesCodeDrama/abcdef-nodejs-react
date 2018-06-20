import React, { Component } from 'react';

//import Post from '../../components/Post/Post';
import PostTable from '../../components/PostTable/PostTable';
import FullPost from '../../components/FullPost/FullPost';
import NewPost from '../../components/NewPost/NewPost';
import './Blog.css';

class Blog extends Component {
    state = {
        coins: [],       
        coinSelected: null
    }

    callApi = async () => {
        const response = await fetch('/api/fromDB');
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
    };

    componentDidMount () {
        this.callApi().then(res =>{ 
            this.setState({ coins: res.DB })
        })
        .catch(err => console.log(err));
    }
        
    coinSelectedHandler = (id) => {
        this.setState({coinSelected: id});
    }

    showCoin = (id) => {
        this.setState({coinSelected: id});
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
                    <FullPost id ={this.state.coinSelected} />
                    <PostTable arr ={this.state.coins} clicked ={this.showCoin} />
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