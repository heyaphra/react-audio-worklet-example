import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Menu, Dropdown, Icon, Button } from 'antd';
import { Bypasser, onePoleFilter, noiseGenerator, bitCrusher } from './Demos'

class App extends Component {
  constructor() {
    super();
    this.state = {
      selected: null, /* Which menu item has been selected? (String) */
      isPlaying: false, /* Is audio currently playing? (Boolean) */
      processor: null, /* Current AudioWorkletProcessor (String) */
      node: null, /* Current AudioWorkletNode (AudioWorkletNode)*/
      moduleLoaded: false, /* Has the selected AudioWorkletProcessor finished loading? (Boolean)*/
      status: null /* Load status message (String) */
    }
  }
  /* loadModule: given a module's name, adds it to the audioWorklet */
  async loadModule() {
    const { state, actx } = this;   
    try {
      await actx.audioWorklet.addModule(`worklet/${state.processor.name}.js`);
      this.setState({moduleLoaded: true, status: null})
      console.log(`loaded module ${state.processor.name}`);
    } catch(e) {
      this.setState({moduleLoaded: false})
      console.log(`Failed to load module ${state.processor.name}`);
    }
  }
  /* handleSelect: loads modules when selected from dropdown menu.
     It also handles instantiating an AudioContext since it's likely the first user gesture.*/
  handleSelect(name, processor) {
    if(this.state.isPlaying) return;
    this.setState({ selected: name, processor: {name: processor.name, cb: processor.cb}, moduleLoaded: false, status: 'Loading module, please wait...' }, () => {
      if(!this.actx) {
        try {
          console.log('New context instantiated')
          this.actx = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {
            console.log(`Sorry, but your browser doesn't support the Web Audio API!`, e);
        }
      } 
      this.loadModule()
    });
  }
  /* toggleNode: starts and stops audio by sending a boolean via the AudioWorkletProcessor's message port.*/
  toggleNode(node, isPlaying, cb){
    const { state } = this;
    if(isPlaying) {
      console.log(`stopping ${state.selected}`)
      node.port.postMessage(false)
    } else {
      console.log(`playing ${state.selected}`)
      node = cb(this);
      this.setState({ node });
      node.port.postMessage(true);          
    }
  }
  /* The function below handles the starting and stopping of the currently loaded module.  */
  handleClick() {
    const { state } = this;
    if(state.selected && state.moduleLoaded) {
      this.setState({isPlaying: !state.isPlaying }, () => {
          this.toggleNode(state.node, state.isPlaying, state.processor.cb);
      });    
    }    
  }
  render() {
    const { state } = this;
    /* Menu is an overlay for the Ant Design dropdown component, passed in via props. */
    const menu = (
      <Menu onClick={(e) => this.handleSelect(e.item.props.name, e.item.props.processor)} selectedKeys={[this.state.current]}>
        <Menu.Item name="Bypass Filter" processor={{name: 'bypass-processor', cb: Bypasser}}>
          Bypass Filter
        </Menu.Item>
        <Menu.Item name="One Pole Filter" processor={{name: 'one-pole-processor', cb: onePoleFilter}}>
          One Pole Filter
        </Menu.Item>
        <Menu.Item name="Noise"  processor={{name: 'noise-generator', cb: noiseGenerator}}>
          Noise
        </Menu.Item>
        <Menu.Item name="Bitcrusher" processor={{name: 'bit-crusher-processor', cb: bitCrusher}}>
          Bitcrusher
        </Menu.Item>   
      </Menu>
    );
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <span>React + AudioWorklet = ❤</span>
          <div style={{float:'left', width: '100%'}}>
            <Dropdown overlay={menu} size='small'>
              <a className="ant-dropdown-link" href="#">
                {state.selected ? state.selected : 'Select a module'} <Icon type="down" />
              </a>
            </Dropdown>
            <Button ghost disabled={!state.moduleLoaded} onClick={() => this.handleClick()} style={{marginLeft:'1%'}}>{state.isPlaying ? 'Stop' : 'Start'}</Button>
          <br />
          <small>{state.status}</small>
          </div>
        </header>
      </div>
    );
  }
}

export default App;