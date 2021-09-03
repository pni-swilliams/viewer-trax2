var nstrumenta;

function initNstrumenta() {
  console.log("initNstrumenta");
  nstrumenta = new Nstrumenta.SandboxClient();

  nstrumenta.addListener("clear", () => {
    console.log("sandbox index.js clear");
  });

  console.log("adding listener inputEvents");
  nstrumenta.addListener("inputEvents", (events) => {
    console.log("sandbox index.js inputEvents");
    document.getElementById('inputEvents').innerText = JSON.stringify(events)
  });

  console.log("adding listener outputEvents");
  nstrumenta.addListener("outputEvents", (events) => {
    console.log("sandbox index.js outputEvents", events);
  });
}
