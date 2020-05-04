import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Rank from './components/Rank/Rank';
import './App.css';
import 'tachyons'

const particalsOptions = {
  particles: {
    number: {
      value: 90,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin', // this is a route value, signin bring up the sign page.
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    password: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
    //{ remove below information to initialState function
      // input: '',
      // imageUrl: '',
      // box: {},
      // route: 'signin', // this is a route value, signin bring up the sign page.
      // isSignedIn: false,
      // user: {
      //   id: '',
      //   name: '',
      //   email: '',
      //   password: '',
      //   entries: 0,
      //   joined: ''
      // }
    // }
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      entries: data.entries,
      joined: data.joined
    }})
  }


  // componentDidMount() {
  //   fetch('http://localhost:3000/')
  //     .then(response => response.json())
  //     .then(data => console.log(data))
  //     }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    //console.log("calculateFaceLocation -> " + width, height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    console.log("App.js - displayFaceBox -> " + box);
    this.setState({box: box});
  }

onInputChange = (event) => {
  //console.log(event.target.value);
  this.setState({input: event.target.value});
}

onPictureSubmit = () => {
  //console.log('App.js onPictureSubmit -> button clicked')
  this.setState({imageUrl: this.state.input});
    fetch('http://localhost:3000/imageUrl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })
  .then(response => response.json())
  .then(response => {
    if (response) {
      fetch('http://localhost:3000/image', {
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id: this.state.user.id
        })
      })
      .then(response => response.json())
      .then(count => {
        this.setState(Object.assign(this.state.user, { entries: count }))
        console.log('count -> ', this.state.user)
      })
      .catch(console.log);
    }
    this.displayFaceBox(this.calculateFaceLocation(response))
  })
  .catch(err => console.log(err));

   /* change below function to ES6 function using => 
   function(response) {
      console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
      this.calculateFaceLocation(response);
    },
    function(err) {
      // there was an error
    }
  );*/
}

  onRouteChange = (route) => {
    // when user signout, it set the signin state to false, 
    // when a new user registered and he can see what the previous user submitted.
    // to fix this need a new function to store the inital information
    if (route === 'signout') { 
      //this.setState({isSignedIn: false} 
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
      this.setState({route: route})
  }

  render() {
   const { isSignedIn, imageUrl, route, box } = this.state; // destructuring 
    return (
      <div className="App">
      <Particles className='particles'
        params={particalsOptions}
      />
      <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
      { route ==='home' // if route is home, show the below page
      ? <div>
        <Logo />
        <Rank name={this.state.user.name} entries={this.state.user.entries} />
        <ImageLinkForm 
          onInputChange={this.onInputChange} 
          onPictureSubmit={this.onPictureSubmit}
        />
        <FaceRecognition box={box} imageUrl={imageUrl}/>
      </div>
      :(
        route ==='signin'
        ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        )
      }
      </div>
    );
  }
}

export default App;
