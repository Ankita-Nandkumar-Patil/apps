alert("Port script loaded!");

window.addEventListener("message", function (event) {
  alert("Port script received message!");
  // We are receiveing messages from any origin, you can check of the origin by
  // using event.origin

  // get the port then use it for communication.
  const port = event.ports[0];
  if (typeof port === 'undefined') return;

  alert("Port script got port!")
  // Post message on this port.
  port.postMessage("Hello from the other side!");
});
