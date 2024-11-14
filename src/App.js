import React, { useEffect, useRef, useState } from 'react';
import Map, { Source, Layer, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Toggle from './components/Toggle';
import sectorsGeoJson from './geofiles/sectors.geojson';
import tmaFSSGeoJson from './geofiles/tmaFSS.geojson';
import tmaGeoJson from './geofiles/finland.geojson';
import routesGeoJson from './geofiles/routes.geojson';
import firsJson from './firs.json';
import pointsGeoJson from './geofiles/points.geojson';
import aerodromesGeoJson from './geofiles/aerodromes.geojson';
import holdsGeoJson from './geofiles/holds.geojson';
import { Sweden, Norway } from './components/OtherAirspaces';
import Legend from './components/Legend';
import Traffic from './components/Traffic';
import mapboxgl from 'mapbox-gl';

import { controllerList, sectorsOwnership, controllerColors, controllerLabels, presets } from './utils/utils';

const mapboxToken = 'pk.eyJ1Ijoib3R0b3R1aGt1bmVuIiwiYSI6ImNseG41dW9vaDAwNzQycXNleWI1MmowbHcifQ.1ZMRPeOQ7z9GRzKILnFNAQ';

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
  const [onlineControllers, setOnlineControllers] = useState(['EFIN_D_CTR',"EFIN_G_CTR","EFIN_M_CTR", "EFIN_H_CTR"]);
  const [activePreset, setActivePreset] = useState(null);
  let mapRef = useRef(null);

  const toggleController = (callsign) => {
    setOnlineControllers(prev =>
      prev.includes(callsign)
        ? prev.filter(c => c !== callsign)
        : [...prev, callsign]
    );
    setActivePreset(null); // Reset preset when a controller is toggled
  };

  const selectPreset = (presetName) => {
    setOnlineControllers(presets[presetName] || []);
    setActivePreset(presetName);
  };

  const getSectorFillColor = (sectorCode) => {
    const owner = getSectorOwner(sectorCode, onlineControllers);
    return owner ? controllerColors[owner] : 'rgb(50, 50, 50)'; // dark gray as default
  };

  const handleMapLoad = (map) => {
    mapRef = map;
    if (map.getLayer('airspace-fills-norway')) {
      map.moveLayer('airspace-fills-norway', 'sectors-fill');
      map.moveLayer('airspace-fills-sweden', 'sectors-fill');
      map.moveLayer('airspace-borders-sweden', 'sectors-fill');
      map.moveLayer('airspace-borders-norway-acc', 'sectors-fill');
      map.moveLayer('airspace-borders-app-sweden', 'sectors-fill');
      map.moveLayer('airspace-borders-norway-app', 'sectors-fill');
    }
  };
  
  return (
    <div style={{ height: '100vh', backgroundColor: '#1e1e1e', color: '#ffffff' }}>

      {/* Map and sectors */}
      <Map
        initialViewState={{
          longitude: 25,
          latitude: 65,
          zoom: 3.8
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/ottotuhkunen/cm19k9u0302b301pbcusdhm1a"
        mapboxAccessToken={mapboxToken}
        onLoad={(event) => handleMapLoad(event.target)}
      >

        <NavigationControl position="top-right" />

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
                'rgb(50, 50, 50)'
              ],
              'fill-opacity': 0.15
            }}
            maxzoom={7}
          />

          <Layer
            id="sectors-border"
            type="line"
            paint={{
              'line-color': '#666666',
              'line-width': 0.7
            }}
            filter={[
              'all',
              ['<', ['zoom'], 6.5]
            ]}
          />

          <Layer
            id="sectors-labels"
            type="symbol"
            layout={{
              'text-field': ['concat', ['get', 'name'], '\n', ['get', 'frequency']],
              'text-size': 10,
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-anchor': 'center',
            }}
            paint={{
              'text-color': 'lightgray',
              'text-halo-color': '#000000',
              'text-halo-width': 0.6
            }}
            filter={[
              'all',
              ['>=', ['zoom'], 5],
              ['<', ['zoom'], 6.5] 
            ]}
          />

        </Source>

        {/* Airspaces in Sweden and Norway */}
        <Sweden />
        <Norway />

        {/* TMA's geojson FINLAND */}
        <Source type="geojson" data={tmaGeoJson}>
          <Layer
            id="tma-lines2"
            type="line"
            paint={{
              'line-color': [
                'case',
                ['==', ['get', 'type'], 'lower'], '#00cc99',
                '#0099cc'
              ],
              'line-width': 0.7,
              'line-dasharray': [2, 1]
            }}
            filter={[
              'all',
              [
                'case',
                ['==', ['get', 'type'], 'lower'],
                ['>', ['zoom'], 6],
                ['all', ['>=', ['zoom'], 6], ['<', ['zoom'], 7.5]]
              ]
            ]}
          />
          <Layer
            id="tma-labels2"
            type="symbol"
            layout={{
              'text-field': ['concat', ['get', 'longcode']],
              'text-size': 10,
              'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular']
            }}
            paint={{
              'text-color': '#ffffff',
              'text-halo-color': '#000000',
              'text-halo-width': 1
            }}
            filter={[
              'all',
              ['>=', ['zoom'], 6],
              ['<', ['zoom'], 7.5] 
            ]}
          />
        </Source>

        {/* TMA FSS geojson */}
        <Source type="geojson" data={tmaFSSGeoJson}>
          <Layer
            id="tma-lines"
            type="line"
            paint={{
              'line-color': ['concat', ['get', 'color']],
              'line-width': 1.5
            }}
          />
          <Layer
            id="tma-labels"
            type="symbol"
            paint={{
              'text-color': '#ffffff',
              'text-halo-color': '#000000',
              'text-halo-width': 1
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

        <Source id="aerodromes" type="geojson" data={aerodromesGeoJson}>
          <Layer
            id="aerodromes-symbol"
            type="symbol"
            layout={{
              'text-field': '+',
              'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
              'text-size': 13,
              'text-offset': [0, 0],
              'text-anchor': 'center',
              'text-allow-overlap': true,
            }}
            paint={{
              'text-color': '#8c8c8c',
              'text-halo-color': 'black',
              'text-halo-width': 0.9,
            }}
            minzoom={5}
          />
          
          <Layer
            id="aerodromes-label"
            type="symbol"
            layout={{
              'text-field': ['get', 'icao'],
              'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
              'text-size': 10,
              'text-offset': [0.8, 0],
              'text-anchor': 'left',
              'text-allow-overlap': true,
            }}
            paint={{
              'text-color': 'lightgray',
              'text-halo-color': '#000000',
              'text-halo-width': 1
            }}
            minzoom={6}
          />
        </Source>

        {/* Airways (routes) */}
        <Source type="geojson" data={routesGeoJson}>
          <Layer
            id="route-lines"
            type="line"
            paint={{
              'line-color': ['concat', ['get', 'color']],
              'line-width': 1,
              'line-dasharray': [
                'case',
                ['==', ['get', 'type'], 'ad_connect'], [2, 3],
                [1]
              ]
            }}
          />
        </Source>

        {/* Holds */}
        <Source type="geojson" data={holdsGeoJson}>
          <Layer
            id="efro-holds-lines"
            type="line"
            paint={{
              'line-color': '#ff4000',
              'line-width': 0.7
            }}
            minzoom={4}
          />
          <Layer
            id="efro-holds-text"
            type="symbol"
            layout={{
              'text-field': ['concat', ['get', 'info']],
              'text-size': 10,
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'icon-allow-overlap': true,
              'text-allow-overlap': true,
            }}
            paint={{
              'text-color': '#ff4000',
              'text-halo-color': 'black',
              'text-halo-width': 0.6
            }}
            minzoom={6}
          />
        </Source>

        <Source id="points" type="geojson" data={pointsGeoJson}>
          <Layer
            id="points-symbol"
            type="symbol"
            layout={{
              'icon-image': [
                'case',
                ['all', ['==', ['get', 'departure'], true], ['==', ['get', 'arrival'], true]], 'fix-all',
                ['==', ['get', 'departure'], true], 'fix-dep',
                ['==', ['get', 'arrival'], true], 'fix-arr',
                'border-dot-13'
              ],
              'icon-size': 1,
              'text-field': ['get', 'name'],
              'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
              'text-size': 10,
              'text-offset': [0.6, 0.6],
              'text-anchor': 'left',
              'icon-allow-overlap': true,
              'text-allow-overlap': true,
            }}
            paint={{
              'text-color': [
                'match',
                ['get', 'type'],
                'hold', 'yellow',
                'white'
              ],
              'text-halo-color': '#000000',
              'text-halo-width': 1
            }}
            minzoom={4}
          />
        </Source>

        <Traffic />
        <Legend />

        <a className='logo' href='https://vatsim-scandinavia.org/' target="_blank">
          <img src='/img/logo.svg'></img>
        </a>

      </Map>
    </div>
  );
};

export default App;

/*
Button controls for EFIN Sectors:

      <div style={{ 
        position: 'fixed',
        top: '0',
        width: '100%',
        paddingTop: '10px', 
        paddingBottom: '10px', 
        display: 'flex', 
        flexWrap: 'wrap', 
        background: '#011328', 
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '100'
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

        <div style={{ 
          position: 'fixed',
          bottom: '0',
          width: '100%',
          paddingTop: '10px', 
          paddingBottom: '10px', 
          display: 'flex', 
          flexWrap: 'wrap', 
          background: '#011328', 
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '10px',
          zIndex: '100'
        }}>
        {Object.keys(presets).map((presetName) => (
          <button
            key={presetName}
            style={{
              margin: '5px',
              padding: '10px',
              background: activePreset === presetName ? '#1a475f' : '#555555',
              color: activePreset === presetName ? '#ffffff' : '#ffffff',
              fontWeight: activePreset === presetName ? 'bold' : 'normal',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => selectPreset(presetName)}
          >
            {presetName}
          </button>
        ))}
      </div>
*/