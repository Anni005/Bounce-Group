// Create connection to Node.JS Server
const socket = io();

let canvas;
let roll = 0;
let pitch = 0;
let yaw = 0;
let boxSize = 100; // Initial box size
let bounce = false; // If trigger a bounce
let bounceAmount = 20; // Amplitude of bouncing

let xPosition = 0; 
let yPosition = 0; 

function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  createEasyCam();
}

function draw() {
  background(255);

  if (bounce) {
    boxSize += bounceAmount; // Increase box size
    bounceAmount -= 2; // Gradually reduce the amplitude
    if (bounceAmount < -20) { // If the bouncing amplitude decreases to the opposite of the initial value, the bouncing ends
      bounce = false;
      bounceAmount = 20; // Reset amplitude
    }
  } else {
    boxSize = 100; // Reset box size
  }

  noStroke();
  let transparency = noise(frameCount * 0.8) * 200 + 55;
  pointLight(150, 200, 255, 100, 100, 300);
  stroke(70, 130, 230, transparency); 
  strokeWeight(2);
  noFill();

  rotateZ(pitch);
  rotateX(roll);
  rotateY(yaw);
  
  translate(xPosition, yPosition, 0); 
  box(boxSize); 
}

//Events we are listening for
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function unpackOSC(message) {
  if (message.address == "/syntien/motion/1/scope1") {
    if (message.args[0] > 10 || message.args[0] < -10) {
      bounce = true;
      roll += map(message.args[0],-3,3,-0.1,0.1);
      pitch += map(message.args[1],-3,3,-0.1,0.1);
      yaw += map(message.args[2],-3,3,-0.1,0.1);
    }
  } else if (message.address == "/syntien/touchpad/1/touchpad1/press") {
    
    let posX = message.args[0];
    let posY = message.args[1];
    let posZ = message.args[2];

    
    roll = map(posX, 0, 1, -PI, PI);
    pitch = map(posY, 0, 1, -PI, PI);
    yaw = map(posZ, 0, 1, -PI, PI);
  } else if (message.address == "/syntien/basic/2/2dslider1") {
    
    let posX = message.args[0];
    let posY = message.args[1];

    
    xPosition = map(posX, 0, 1, -width/2, width/2); 
    yPosition = map(posY, 0, 1, -height/2, height/2); 
  }
}

// Connect to Node.JS Server
socket.on("connect", () => {
  console.log(socket.id);
});

// Callback function on the event we disconnect
socket.on("disconnect", () => {
  console.log(socket.id);
});

// Callback function to receive message from Node.JS
socket.on("message", (_message) => {
  console.log(_message);
  unpackOSC(_message);
});
