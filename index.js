
var inputFiles = [];

var sendMessageToParent = null;

let algorithmWorker;

window.addEventListener("message", (e) => {
  sendMessageToParent = function (message) {
    e.source.postMessage(message, e.origin);
  }
  console.log('message from parent: ', e.data.type);
  switch (e.data.type) {
    case 'reload':
      location.reload();
      break;
    case 'setIdbKey':
      idbKey = e.data.payload;
      sendMessageToParent('set idbKey');
      break;
    case 'clear':
      clear();
      break;
    case 'loadFile':
      sendMessageToParent('loading file');
      inputFiles[e.data.payload.name] = e.data.payload.fileContents;
      renderFiles();
      // renderEvents(e.data.payload.name, e.data.payload.fileContents);
      sendMessageToParent('loaded file');
      break;
    case 'centerMap':
      centerMap();
      break;
    case 'run':
      algorithmWorker.postMessage({ type: 'run', payload: idbKey });
      break;
    case 'setParameters':
      nst_project.parameters = e.data.payload;
      algorithmWorker.postMessage({ type: "setNstProject", payload: nst_project });
      break;
    case 'setControls':
      nst_project.controls = e.data.payload;
      seekTime(nst_project.controls.find(item => item.id === 'controlTime').value);
      renderMarkers();
      algorithmWorker.postMessage({ type: "setNstProject", payload: nst_project });
      break;
    case 'takeScreenshot':
      takeScreenShot().then(imgData => {
        sendMessageToParent({
          type: 'screenShot',
          data: imgData
        });
      });
      break;
    default:
      sendMessageToParent('unknown message type:' + e.data.type);
      break;
  }
}, false);

const labels = {
  1: {
    name: 'Accelerometer',
    type: 'input',
    traces: ['Acc x', 'Acc y', 'Acc z']
  },
  2: {
    name: 'Magnetometer',
    type: 'input',
    traces: ['Mag x', 'Mag y', 'Mag z']
  },
  4: {
    name: 'Gyro',
    type: 'input',
    traces: ['Gyro x', 'Gyro y', 'Gyro z']
  },
  6: {
    name: 'Pressure',
    type: 'input',
    traces: ['P (mB)']
  },
  7: {
    name: 'Temperature',
    type: 'input',
    traces: ['Temp(°C)']
  },
  11: {
    name: 'Rotation Vector',
    type: 'input',
    traces: ['x', 'y', 'z', 'w']
  },
  20: {
    name: 'Geomagnetic Rotation Vector',
    type: 'input',
    traces: ['x', 'y', 'z', 'w']
  },
  65666: {
    name: 'GPS',
    type: 'computed',
    traces: ['lat', 'lon', 'alt', 'hdop', 'pdop', 'speed', 'track', 'vdop']
  },
  65667: {
    name: 'Vehicle Data',
    type: 'input',
    traces: ['Vehicle speed (m/s)', 'Yaw rate (Degree/Sec)', 'Steering Wheel (Degree)', 'Front Left Wheel Speed (m/s)', 'Front Right Wheel Speed (m/s)', 'Rear Left Wheel Speed (m/s)', 'Rear Right Wheel Speed (m/s)']
  },

  65668: {
    name: 'Applanix',
    type: 'input',
    traces: ['latitude', 'longitude', 'altitude', 'roll (degree)', 'pitch (degree)', 'heading (degree)', 'speed (mps)']
  },
  28: {
    name: 'Fused Location (6DOF)',
    type: 'computed',
    traces: ['quaternion x', 'quaternion y', 'quaternion z', 'quaternion w', 'position x', 'position y', 'position z']
  },
  302: {
    name: 'Fused Location (Geo coords)',
    type: 'computed',
    traces: ['lat', 'lng', 'previous lat', 'previous lng']
  },
  1002: {
    name: 'Truth Point (Geo coords)',
    type: 'computed',
    traces: ['lat', 'lng', 'altitude']
  },
  1003: {
    name: 'Angular Error (Fused vs. Applanix)',
    type: 'computed',
    traces: ['error mag (degrees)', 'heading difference mag (degrees)', 'error gyro (degrees)', 'heading difference gyro (degrees)', 'heading(applanix)', 'pitch(applanix)', 'roll(applanix)', 'heading(gyro)', 'pitch(gyro)', 'roll(gyro)', 'applanix delta angle']
  },
  1006: {
    name: 'Magnetic Field (Filtered vs. Applanix with World Magnetic Model)',
    type: 'computed',
    traces: ['mag error magnitude', 'unfiltered x', 'unfiltered y', 'unfiltered z', 'unfiltered total', 'filtered x', 'filtered y', 'filtered z', 'filtered total', 'applanix x', 'applanix y', 'applanix z', 'applanix total',]
  },
  1008: {
    name: 'Fused Mag',
    type: 'computed',
    traces: ['latitude', 'longitude', 'altitude', 'roll (degree)', 'pitch (degree)', 'heading (degree)', 'speed (mps)']

  },
  1009: {
    name: 'Fused Gyro',
    type: 'computed',
    traces: ['latitude', 'longitude', 'altitude', 'roll (degree)', 'pitch (degree)', 'heading (degree)', 'speed (mps)']

  },
  1010: {
    name: 'Position',
    type: 'computed',
    traces: ['Pos delta magnitude vdr to gps (m)', 'Pos delta magnitude gyro to gps (m)', 'Pos delta magnitude mag+accel to gps (m)', 'vdr x', 'vdr y', 'vdr z', 'mag x', 'mag y', 'mag z', 'gps x', 'gps y', 'gps z']
  },
  1011: {
    name: 'Fused VDR',
    type: 'computed',
    traces: ['latitude', 'longitude', 'altitude', 'roll (degree)', 'pitch (degree)', 'heading (degree)', 'speed (mps)']
  },

  2000: {
    name: 'Kalman Quaternion',
    type: 'computed',
    traces: ['x', 'y', 'z', 'w', 'measured x', 'measured y', 'measured z']
  },
  2001: {
    name: 'Pitch and Roll',
    type: 'computed',
    traces: ['Pitch and Roll Error', 'Acc+Mag heading', 'Acc pitch', 'Acc roll', 'Gyro-prop heading', 'Gyro-prop pitch', 'Gyro-prop roll']
  },
  2010: {
    name: 'Simple Accel Filter',
    type: 'computed',
    traces: ['Acc_Out X', 'Acc_Out Y', 'Acc_Out Z']
  },
  3000: {
    name: 'Bluecoin',
    type: 'input',
    traces: []
  },
  3001: {
    name: 'Thingy',
    type: 'input',
    traces: ['Bluetooth Acc x', 'Bluetooth Acc y', 'Bluetooth Acc z', 'Bluetooth Gyro x', 'Bluetooth Gyro y', 'Bluetooth Gyro z', 'Bluetooth Mag x', 'Bluetooth Mag y', 'Bluetooth Mag z']
  },
    3002: {
    name: 'Trax',
    type: 'input',
    traces: [
      'Trax timestamp',
      'Trax Acc x',
      'Trax Acc y',
      'Trax Acc z',
      'Trax Gyro x',
      'Trax Gyro y',
      'Trax Gyro z',
      'Trax Mag x',
      'Trax Mag y',
      'Trax Mag z',
    ],
  },

}

var myLayout;

function initLayout() {
  const config = {
    labels: {
      popout: false
    },
    content: [
      {
        type: 'stack',
        content: []
      }
    ]
  };

  myLayout = new GoldenLayout(config);
  myLayout.on('stateChanged', function () {
    try {
      var state = JSON.stringify(myLayout.toConfig());
      localStorage.setItem('savedState', state);
    } catch (e) {
      console.log('layout not saved: ' + e)
    }
  });

  myLayout.registerComponent('plots', function (container, componentState) { });

  myLayout.init();
}

initLayout();

var plots = {};

function renderEvents(name, events) {
  events.forEach((event) => {
    addEventToPlots(name, event);
  });
  updatePlots();
}

function renderFiles() {
  clear();
  for (fileName in inputFiles) {
    renderEvents(fileName, inputFiles[fileName]);
  }
}

function getPlotName(id) {
  if (labels.hasOwnProperty(id)) {
    return labels[id].name;
  }
  return id;
}

function updatePlots() {
  for (index in plots) {
    plots[index].update();
  }
}

function clear() {
  plots = {};
  myLayout.destroy();
  initLayout();
}

var lastPlotUpdate = 0;
function addEventToPlots(name, event) {
  var plotId = name;
  if (!plots.hasOwnProperty(plotId)) {
    plots[plotId] = new Plot(plotId, event);
  }
  plots[plotId].addEvent(event);
}

function takeScreenShot() {
  return html2canvas(document.body, { useCORS: true }).then(canvas => {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        resolve(blob)
      }, 'image/jpeg', 0.95);
    })
  });
}


class Plot {
  constructor(id, event) {
    this.id = id;
    this.plotName = getPlotName(this.id);
    this.eventIdMap = {};
    this.data = [];
    // for (var i = 0; i < event.values.length; i++) {
    //   var emptyTrace = {
    //     x: [],
    //     y: []
    //   };
    //   if (labels.hasOwnProperty(this.id)) {
    //     if (labels[this.id].traces[i] != null) {
    //       emptyTrace.name = labels[this.id].traces[i];
    //     }
    //   }
    //   this.data.push(emptyTrace);
    // }

    let relayout;

    myLayout.registerComponent(this.plotName, function (container, state) {
      relayout = async () => {
        var update = {
          width: container.width,
          height: container.height
        };
        // Plotly.relayout(container, update);
        if (document.getElementById(state.componentName) != null) {
          try {
            Plotly.relayout(state.componentName, update);
          } catch (e) {
          }
        }
      }
      container.getElement().html('<div id="' + state.componentName + '"></div>');
      container.on('resize', function () {
        relayout();
      });
    })
    myLayout.root.contentItems[0].addChild({
      type: 'component',
      componentName: this.plotName
    })
    Plotly.react(this.plotName, this.data, {}, {
      displayModeBar: false
    }).then(() => { relayout() });

  }


  clearData() {
    for (var i = 0; i < this.data.length; i++) {
      this.data[i].x = [];
      this.data[i].y = [];
    }
    //this.update()
  }

  addEvent(event) {
    if (!this.eventIdMap.hasOwnProperty(event.id)) {
      this.eventIdMap[event.id] = [];
      for (var i = 0; i < event.values.length; i++) {
        this.eventIdMap[event.id].push(this.data.length);
        const emptyTrace = {
          x: [],
          y: []
        };
        if (labels.hasOwnProperty(event.id)) {
          if (labels[event.id].traces[i] != null) {
            emptyTrace.name = labels[event.id].traces[i];
          }
        }
        this.data.push(emptyTrace);
      }
    }
    for (var i = 0; i < event.values.length; i++) {
      this.data[this.eventIdMap[event.id][i]].x.push(event.timestamp);
      this.data[this.eventIdMap[event.id][i]].y.push(event.values[i]);
    }
  }
  update() {
    Plotly.react(this.plotName, this.data, { datarevision: Date.now() }, {
      displayModeBar: false
    });
  }
}