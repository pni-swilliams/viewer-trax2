import React, { useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { NstrumentaClient } from "nstrumenta";

function App() {
  useEffect(() => {
    //get wsUrl from params if present
    const wsUrlParam = new URLSearchParams(window.location.search).get("wsUrl");

    const wsUrl = wsUrlParam ? wsUrlParam : "ws://localhost:8088";

    const nstClient = new NstrumentaClient({
      apiKey: "",
      projectId: "",
      wsUrl,
    });

    console.log("connecting to ", wsUrl);

    nstClient.addListener("open", () => {
      console.log("nst client open");
      nstClient.subscribe("serialport-events", (message) => {
        console.log("serialport-events", message);
        switch (message.type) {
          case "open":
            // kGetModInfo
            const kGetModInfoCommand = new Uint8Array([
              0x00, 0x05, 0x01, 0xef, 0xd4,
            ]);
            console.log("sending kGetModInfo", kGetModInfoCommand);
            nstClient.sendBuffer("trax-in", kGetModInfoCommand);
        }
      });
      nstClient.subscribe("trax2", (message) => {
        console.log("trax2", message);
      });

    
      // // kGetModInfo
      // const kGetModInfoCommand = new Uint8Array([0x00, 0x05, 0x01, 0xef, 0xd4]);
      // console.log("sending kGetModInfo", kGetModInfoCommand);
      // nstClient.sendBuffer("trax", kGetModInfoCommand);

    });
    nstClient.init();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
