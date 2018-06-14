import React, { Component } from 'react';
import axios from 'axios';

import './FullPost.css';

class FullPost extends Component {
    state = {
        loadedPost: null,
        currency: ''
    }

    componentDidUpdate () {
        if ( this.props.id ) {
            if ( !this.state.loadedPost || (this.state.loadedPost && this.state.loadedPost.id !== this.props.id) ) {
                axios.get( 'https://api.coinmarketcap.com/v2/ticker/' + this.props.id )
                    .then( response => {
                        this.setState( { loadedPost: response.data.data,
                                         currency: response.data.data.quotes.USD.price                    
                        } ); //divide into substate later
                    } );
            }
        }
    }

    changeCurrency = (c) => {
        console.log(c)
        axios.get( 'https://api.coinmarketcap.com/v2/ticker/' + this.props.id + '/?convert=' + c)
        .then( response => {
            // console.log(response);
            switch(c){
                case 'EUR': 
                    this.setState( { currency: response.data.data.quotes.EUR.price} ); //divide into substate later
                    break;
                case 'THB': 
                    this.setState( { currency: response.data.data.quotes.THB.price} ); //divide into substate later
                    break;
            }
        } );
    }

    render () {
    let post = (
        <div className="FullPost">
        <p style={{ textAlign: 'center' }}>Please select a coin!</p>
        </div>);
        if ( this.props.id ) {
        post = (
            <div className="FullPost">
            <p style={{ textAlign: 'center' }}>Loading...!</p>
            </div>);
        }
        if ( this.state.loadedPost ) {
            post = (
                <div className="FullPost">
                    <h1>{this.state.loadedPost.name}</h1>
                    <p>{this.state.currency}</p>
                    <div className="Edit">
                        <button onClick={() => this.changeCurrency('EUR')} className="Delete">EUR</button>
                        <button onClick={() => this.changeCurrency('THB')} className="Delete">THB</button>
                    </div>
                </div>

            );
        }
        return post;
    }
}

export default FullPost;