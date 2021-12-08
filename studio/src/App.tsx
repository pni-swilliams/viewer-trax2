import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { NstrumentaClient } from "nstrumenta";
import { Button, Typography } from "@mui/material";

function App() {
  const [traxState, setTraxState] = useState<string>();
  const [modInfo, setModInfo] = useState<string>();

  const nstRef = useRef<NstrumentaClient>();

  const getModInfo = () => {
    if (!nstRef.current) return;
    // kGetModInfo
    const kGetModInfoCommand = new Uint8Array([0x00, 0x05, 0x01, 0xef, 0xd4]);
    console.log("sending kGetModInfo", kGetModInfoCommand);
    nstRef.current.sendBuffer("trax-in", kGetModInfoCommand);
  };

  useEffect(() => {
    //get wsUrl from params if present
    const wsUrlParam = new URLSearchParams(window.location.search).get("wsUrl");

    const wsUrl = wsUrlParam ? wsUrlParam : "ws://localhost:8088";

    const nstClient = new NstrumentaClient({
      apiKey: "",
      projectId: "",
      wsUrl,
    });

    nstRef.current = nstClient;

    console.log("connecting to ", wsUrl);

    nstClient.addListener("open", () => {
      console.log("nst client open");
      nstClient.subscribe("serialport-events", (message) => {
        console.log("serialport-events", message);
        switch (message.type) {
          case "open":
            setTraxState("open");
            getModInfo();
        }
      });
      nstClient.subscribe("trax2", (message) => {
        if (traxState !== "open") setTraxState("open");
        console.log("trax2", message);
        const frameId = message.data[2];
        switch (frameId) {
          case 0x02:
            const modInfo = new TextDecoder().decode(
              new Uint8Array(message.data.slice(3, -2))
            );
            console.log(JSON.stringify(message), modInfo);
            setModInfo(modInfo);
            break;
          default:
            console.log(`unhandled frame ID: ${frameId}`, message);
            break;
        }
      });
    });
    nstClient.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App">
      <Typography>
        <Button variant="contained" onClick={getModInfo}>
          kGetModInfo
        </Button>
        {modInfo}
      </Typography>
    </div>
  );
}

export default App;
