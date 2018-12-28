/**
 * A simple bypass node demo.
 *
 * @class BypassProcessor
 * @extends AudioWorkletProcessor
 */

class BypassProcessor extends AudioWorkletProcessor {

    constructor() {
      super();
      this.isPlaying = true;
      this.port.onmessage = this.onmessage.bind(this)
    }

    onmessage(event) {
      const { data } = event;
      this.isPlaying = data;
    }
  
    process(inputs, outputs) {
      if(!this.isPlaying) {
        return;
      }
      // By default, the node has single input and output.
      const input = inputs[0];
      const output = outputs[0];
  
      for (let channel = 0; channel < output.length; ++channel) {
        output[channel].set(input[channel]);
      }
  
      return this.isPlaying;
    }
  }
  
  registerProcessor('bypass-processor', BypassProcessor);