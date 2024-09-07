import React, { useState } from 'react';
import Map, { Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import sectorsGeoJson from './sectors.geojson';
import tmaGeoJson from './tma.geojson';
import firsJson from './firs.json';

const mapboxToken = 'pk.eyJ1Ijoib3R0b3R1aGt1bmVuIiwiYSI6ImNseG41dW9vaDAwNzQycXNleWI1MmowbHcifQ.1ZMRPeOQ7z9GRzKILnFNAQ';

const controllerList = [
  'EFIN_A_CTR', 'EFIN_B_CTR', 'EFIN_C_CTR', 'EFIN_D_CTR', 'EFIN_E_CTR', 
  'EFIN_F_CTR', 'EFIN_G_CTR', 'EFIN_H_CTR', 'EFIN_J_CTR', 'EFIN_K_CTR',
  'EFIN_L_CTR', 'EFIN_M_CTR', 'EFIN_N_CTR', 'EFIN_V_CTR'
];

const sectorsOwnership = {
  sector1: ['A', 'D', 'C'],
  sector2: ['B', 'C', 'D'],
  sector3: ['C', 'D'],
  sector4: ['D', 'C'],
  sector5: ['E', 'F', 'D', 'C'],
  sector6: ['F', 'D', 'C'],
  sector7: ['G', 'F', 'D', 'C'],
  sector8: ['H', 'V', 'M', 'G', 'F', 'D'],
  sector9: ['J', 'H', 'V', 'M', 'G', 'F', 'D'],
  sector10: ['K', 'M', 'G', 'F', 'D', 'C'],
  sector11: ['L', 'N', 'M', 'G', 'F', 'D', 'C'],
  sector12: ['M', 'G', 'F', 'D', 'C'],
  sector13: ['N', 'M', 'G', 'F', 'D', 'C'],
  sector14: ['V', 'M', 'G', 'F', 'D', 'C']
};

// Dark-themed colors for controllers
const controllerColors = {
  'EFIN_A_CTR': '#2f4f4f',      // darkslategray
  'EFIN_B_CTR': '#8b0000',      // darkred
  'EFIN_C_CTR': '#ff8c00',      // darkorange
  'EFIN_D_CTR': '#00bfff',      // midnightblue
  'EFIN_E_CTR': '#ffff00',      // yellow
  'EFIN_F_CTR': '#006400',      // darkgreen
  'EFIN_G_CTR': '#00ff00',      // lime
  'EFIN_H_CTR': '#deb887',      // burlywood
  'EFIN_J_CTR': '#0000cd',      // mediumblue
  'EFIN_K_CTR': '#dda0dd',      // plum
  'EFIN_L_CTR': '#191970',      // deepskyblue
  'EFIN_M_CTR': '#ff1493',      // deeppink
  'EFIN_N_CTR': '#98fb98',      // palegreen
  'EFIN_V_CTR': '#ff4500'       // orange red
};


const controllerLabels = {
  'EFIN_A_CTR': 'EFIN A',
  'EFIN_B_CTR': 'EFIN B',
  'EFIN_C_CTR': 'EFIN C',
  'EFIN_D_CTR': 'EFIN D',
  'EFIN_E_CTR': 'EFIN E',
  'EFIN_F_CTR': 'EFIN F',
  'EFIN_G_CTR': 'EFIN G',
  'EFIN_H_CTR': 'EFIN H',
  'EFIN_J_CTR': 'EFIN J',
  'EFIN_K_CTR': 'EFIN K',
  'EFIN_L_CTR': 'EFIN L',
  'EFIN_M_CTR': 'EFIN M',
  'EFIN_N_CTR': 'EFIN N',
  'EFIN_V_CTR': 'EFIN V'
};


// Determine which controller owns the sector
const getSectorOwner = (sectorCode, onlineControllers) => {
  const sectorControllers = sectorsOwnership[sectorCode];
  for (let controller of sectorControllers) {
    const callsign = `EFIN_${controller}_CTR`;
    if (onlineControllers.includes(callsign)) {
      return callsign;
    }
  }
  return null;
};

const App = () => {
  const [onlineControllers, setOnlineControllers] = useState(['EFIN_D_CTR']);

  const toggleController = (callsign) => {
    setOnlineControllers(prev =>
      prev.includes(callsign)
        ? prev.filter(c => c !== callsign)
        : [...prev, callsign]
    );
  };

  // Determine the color for each sector based on the controller
  const getSectorFillColor = (sectorCode) => {
    const owner = getSectorOwner(sectorCode, onlineControllers);
    return owner ? controllerColors[owner] : 'rgb(50, 50, 50)'; // dark gray as default
  };

  return (
      <div style={{ height: '100vh', backgroundColor: '#1e1e1e', color: '#ffffff' }}>
      {/* Controller buttons */}
      <div style={{ 
        padding: '10px', 
        display: 'flex', 
        flexWrap: 'wrap', 
        background: '#333', 
        justifyContent: 'center', // Center buttons horizontally
        alignItems: 'center'      // Center buttons vertically
      }}>
        {controllerList.map((controller) => (
          <button
            key={controller}
            style={{
              margin: '5px',
              padding: '10px',
              background: onlineControllers.includes(controller) ? controllerColors[controller] : '#555555',
              color: onlineControllers.includes(controller) ? '#000000' : '#ffffff',
              fontWeight: onlineControllers.includes(controller) ? 'bold' : 'normal',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => toggleController(controller)}
          >
            {controllerLabels[controller]}
          </button>
        ))}

      </div>

      {/* Map and sectors */}
      <Map
        initialViewState={{
          longitude: 25,
          latitude: 65,
          zoom: 4
        }}
        style={{ width: '100%', height: '90%' }}
        mapStyle="mapbox://styles/mapbox/dark-v10"  // Dark theme map
        mapboxAccessToken={mapboxToken}
      >
        {/* TMA geojson */}
        <Source type="geojson" data={tmaGeoJson}>
          <Layer
            id="tma-lines"
            type="line"
            paint={{
              'line-color': '#00bfff',
              'line-width': 0.8,
              'line-dasharray': [4, 2]
            }}
          />
        </Source>

        {/* FIRs geojson */}
        <Source type="geojson" data={firsJson}>
          <Layer
            id="firs-lines"
            type="line"
            paint={{
              'line-color': '#006400',
              'line-width': 1.5
            }}
          />
        </Source>

        <Source type="geojson" data={sectorsGeoJson}>
          <Layer
            id="sectors-fill"
            type="fill"
            paint={{
              'fill-color': [
                'match',
                ['get', 'code'],
                'sector1', getSectorFillColor('sector1'),
                'sector2', getSectorFillColor('sector2'),
                'sector3', getSectorFillColor('sector3'),
                'sector4', getSectorFillColor('sector4'),
                'sector5', getSectorFillColor('sector5'),
                'sector6', getSectorFillColor('sector6'),
                'sector7', getSectorFillColor('sector7'),
                'sector8', getSectorFillColor('sector8'),
                'sector9', getSectorFillColor('sector9'),
                'sector10', getSectorFillColor('sector10'),
                'sector11', getSectorFillColor('sector11'),
                'sector12', getSectorFillColor('sector12'),
                'sector13', getSectorFillColor('sector13'),
                'sector14', getSectorFillColor('sector14'),
                'rgb(50, 50, 50)' // Default color (dark gray)
              ],
              'fill-opacity': 0.3
            }}
          />
          <Layer
            id="sectors-border"
            type="line"
            paint={{
              'line-color': 'gray',
              'line-width': 1
            }}
          />
        </Source>

      </Map>
    </div>
  );
};

export default App;
