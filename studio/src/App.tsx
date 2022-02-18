import { Button, Grid, TextField } from "@mui/material";
import { NstrumentaClient } from "nstrumenta";
import React, {
  ChangeEventHandler,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import "./App.css";
import DataBuffer from "./DataBuffer";
// CRC implementation from TRAX2 User Manual
// function(CRC(void * data, UInt32 len) {
//   UInt8 * dataPtr = (UInt8 *)data;
//   UInt32 index = 0;
//   // Update the CRC for transmitted and received data using // the CCITT 16bit algorithm (X^16 + X^12 + X^5 + 1). UInt16 crc = 0;
//   while(len--)
//   {
//   crc = (unsigned char)(crc >> 8) | (crc << 8);
//   crc ^= dataPtr[index++];
//   crc ^= (unsigned char)(crc & 0xff) >> 4;
//   crc ^= (crc << 8) << 4;`
//   crc ^= ((crc & 0xff) << 4) << 1;
//   }
//   return crc;
//   }

function App() {
  const [traxState, setTraxState] = useState<string>();
  const [modInfo, setModInfo] = useState<string>();
  const [traxMessage, setTraxMessage] = useState<Uint8Array>();

  const dataRef = useRef<DataBuffer>();
  // store data in dataRef and forceUpdate for re-render
  // eslint-disable-next-line
  const [_, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const nstRef = useRef<NstrumentaClient>();

  const traxWithCrc16 = (data: number[]): Uint8Array => {
    let index = 0;
    let crc = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      crc = ((crc >> 8) | (crc << 8)) & 0xffff;
      crc ^= data[index++];
      crc ^= (crc & 0xff) >> 4;
      crc ^= ((crc << 8) << 4) & 0xffff;
      crc ^= (((crc & 0xff) << 4) << 1) & 0xffff;
    }
    return Uint8Array.from([
      ...data,
      (crc & 0xff00) >> 8,
      crc & 0x00ff,
    ] as number[]);
  };

  function toHexString(byteArray: Uint8Array) {
    return [...byteArray].map((x) => x.toString(16).padStart(2, "0")).join(" ");
  }

  const getModInfo = () => {
    if (!nstRef.current) return;
    // kGetModInfo
    const kGetModInfoCommand = traxWithCrc16([0x00, 0x05, 0x01]);
    console.log("sending kGetModInfo", kGetModInfoCommand);
    nstRef.current.sendBuffer("trax-in", kGetModInfoCommand);
  };

  const sendBytes = (bytes: Uint8Array) => {
    if (!nstRef.current) return;
    nstRef.current.sendBuffer("trax-in", bytes);
  };

  const updateMessage: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    console.log(e.target.value);
    try {
      const numberArray = e.target.value
        .replace("[", "")
        .replace("]", "")
        .split(/[ ,]+/)
        .map((str) => parseInt(str, 16));

      const tryParse = traxWithCrc16(numberArray);
      console.log(tryParse);
      setTraxMessage(tryParse);
    } catch {}
  };

  useEffect(() => {
    //get wsUrl from params if present
    const wsUrlParam = new URLSearchParams(window.location.search).get("wsUrl");

    const wsUrl = wsUrlParam
      ? new URL(wsUrlParam)
      : new URL("ws://localhost:8088");

    const apiKey =
      new URLSearchParams(window.location.search).get("apiKey") || "";

    const nstClient = new NstrumentaClient();

    nstRef.current = nstClient;

    dataRef.current = new DataBuffer(100);

    console.log("connecting to ", wsUrl);

    nstClient.addListener("open", () => {
      console.log("nst client open");
      nstClient.addSubscription("serialport-events", (message) => {
        console.log("serialport-events", message);
        switch (message.type) {
          case "open":
            setTraxState("open");
        }
      });
      nstClient.addSubscription("time", (message) => {
        console.log(message);
      });
      nstClient.addSubscription("trax2", (message) => {
        if (traxState !== "open") setTraxState("open");

        dataRef.current?.add(new Uint8Array(message.data));
        forceUpdate();

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
          case 0x05:
            console.log("data");
            break;

          default:
            console.log(`unhandled frame ID: ${frameId}`, message);
            break;
        }
      });
    });
    nstClient.connect({ wsUrl, apiKey });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Button variant="contained" onClick={getModInfo}>
            kGetModInfo
          </Button>
          {modInfo}
        </Grid>
        <Grid item xs={4}>
          <TextField
            id="outlined-basic"
            label="[0x00,0x05,0x01]"
            variant="outlined"
            onChange={updateMessage}
          />
        </Grid>
        <Grid item xs={3}>
          {traxMessage ? toHexString(traxMessage) : null}
        </Grid>
        <Grid item xs={1}>
          <Button
            variant="contained"
            onClick={() => {
              if (traxMessage) {
                sendBytes(traxMessage);
              }
            }}
          >
            Send
          </Button>
        </Grid>
      </Grid>
      <div style={{ width: "100%", whiteSpace: "pre-line" }}>
        {dataRef.current?.buffer
          .reverse()
          .map((message) => {
            return toHexString(message);
          })
          .join("\n")}
      </div>
    </div>
  );
}

export default App;
