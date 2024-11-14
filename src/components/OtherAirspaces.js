import React, { useEffect, useState, useRef } from 'react';
import { Source, Layer, useMap } from 'react-map-gl';
import { otherControllerColors} from '../utils/utils';

import swedenGeoJsonUrl from '../geofiles/sweden.geojson';
import norwayGeoJsonUrl from '../geofiles/norway.geojson';

const defaultColor = 'transparent';

const ownersOnline = ['SK', 'SN', 'S3', 'S1', '1R', '5R', '6R', '18R', '24R', '26R', '17R'];

const getOwnerColor = (owners) => {
  if (!Array.isArray(owners)) {
    owners = [owners];
  }
  for (const owner of owners) {
    if (ownersOnline.includes(owner)) {
      return otherControllerColors[owner] || defaultColor;
    }
  }
  return defaultColor;
};

const getProcessedGeoJson = (geoJson) => {
  if (!geoJson || !geoJson.features || !Array.isArray(geoJson.features)) {
    console.error('Invalid GeoJSON data:', geoJson);
    return geoJson; 
  }

  return {
    ...geoJson,
    features: geoJson.features.map(feature => {
      if (feature.properties.group === 'ACC') {
        const color = getOwnerColor(feature.properties.owner);
        return {
          ...feature,
          properties: {
            ...feature.properties,
            color: color
          }
        };
      }
      return feature;
    })
  };
};

const fetchGeoJson = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching GeoJSON data:', error);
    return null;
  }
};

const useMapInstance = () => {
  const mapRef = useRef(null);
  const { map } = useMap();

  useEffect(() => {
    mapRef.current = map; 
  }, [map]);

  return mapRef;
};

const Sweden = () => {
  const [geoJson, setGeoJson] = useState(null);
  const hasLogged = useRef(false);
  const mapRef = useMapInstance();

  useEffect(() => {
    if (!hasLogged.current) {
      hasLogged.current = true;
    }
    const loadGeoJson = async () => {
      const data = await fetchGeoJson(swedenGeoJsonUrl);
      setGeoJson(getProcessedGeoJson(data));
    };
    loadGeoJson();
  }, []);

  if (!geoJson) return null;

  return (
    <Source id="sweden-source" type="geojson" data={geoJson}>
      <Layer
        id="airspace-fills-sweden"
        type="fill"
        paint={{
          'fill-color': [
            'match',
            ['get', 'group'],
            'TWR', 'transparent',
            'APP', 'transparent',
            'ACC', ['coalesce', ['get', 'color'], defaultColor],
            defaultColor
          ],
          'fill-opacity': 0.1,
        }}
        filter={[
          'all',
          ['==', ['get', 'group'], 'ACC']
        ]}
        maxzoom={7}
      />
      <Layer
        id="airspace-borders-sweden"
        type="line"
        paint={{
          'line-color': [
            'match',
            ['get', 'group'],
            'TWR', '#00cc99',
            'APP', '#0099cc',
            'ACC', '#666666',
            defaultColor
          ],
          'line-width': 0.7,
          'line-dasharray': [
            'match',
            ['get', 'group'],
            'TWR', [2, 1],
            'APP', [2, 1],
            'ACC', [1],
            [0]
          ]
        }}
        filter={[
          'all',
          [
            'match',
            ['get', 'group'],
            'ACC', true,
            false
          ],
          ['<', ['zoom'], 6.5]
        ]}
      />
      <Layer
        id="airspace-borders-twr-sweden"
        type="line"
        paint={{
          'line-color': '#00cc99',
          'line-width': 0.7,
          'line-dasharray': [2, 1]
        }}
        filter={[
          'all',
          ['==', ['get', 'group'], 'TWR'],
          ['>=', ['zoom'], 7]
        ]}
      />
      <Layer
        id="airspace-borders-app-sweden"
        type="line"
        paint={{
          'line-color': '#0099cc',
          'line-width': 0.7,
          'line-dasharray': [2, 1]
        }}
        filter={[
          'all',
          ['==', ['get', 'group'], 'APP'],
          ['>=', ['zoom'], 6],
          ['<', ['zoom'], 7.5]
        ]}
      />

      <Layer
        id="tma-labels-sweden"
        type="symbol"
        layout={{
          'text-field': [
            'case', 
            ['==', ['get', 'group'], 'APP'], 
            ['get', 'id'], 
            ''
          ],
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

      <Layer
        id="sectors-labels-sweden"
        type="symbol"
        layout={{
          'text-field': [
            'case', 
            ['==', ['get', 'group'], 'ACC'], 
            ['get', 'id'], 
            ''
          ],
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
  );
};

const Norway = () => {
  const [geoJson, setGeoJson] = useState(null);
  const hasLogged = useRef(false);
  const mapRef = useMapInstance();

  useEffect(() => {
    if (!hasLogged.current) {
      // console.log("Norway component mounted");
      hasLogged.current = true;
    }
    const loadGeoJson = async () => {
      const data = await fetchGeoJson(norwayGeoJsonUrl);
      setGeoJson(getProcessedGeoJson(data));
    };
    loadGeoJson();
  }, []);

  if (!geoJson) return null;

  return (
    <Source id="norway-source" type="geojson" data={geoJson}>
      <Layer
        id="airspace-fills-norway"
        type="fill"
        paint={{
          'fill-color': [
            'match',
            ['get', 'group'],
            'TWR', 'transparent',
            'APP', 'transparent',
            'ACC', ['coalesce', ['get', 'color'], defaultColor],
            defaultColor
          ],
          'fill-opacity': 0.05,
        }}
        filter={[
          'all',
          ['==', ['get', 'group'], 'ACC']
        ]}
        maxzoom={7}
      />
      <Layer
        id="airspace-borders-norway-acc"
        type="line"
        paint={{
          'line-color': [
            'match',
            ['get', 'group'],
            'TWR', '#00cc99',
            'APP', '#0099cc',
            'ACC', '#666666',
            defaultColor
          ],
          'line-width': 0.7,
          'line-dasharray': [
            'match',
            ['get', 'group'],
            'TWR', [2, 1],
            'APP', [2, 1],
            'ACC', [1],
            [0]
          ]
        }}
        filter={[
          'all',
          ['==', ['get', 'group'], 'ACC'],
          ['<', ['zoom'], 6.5]
        ]}
      />
      <Layer
        id="airspace-borders-norway-twr"
        type="line"
        paint={{
          'line-color': '#00cc99',
          'line-width': 0.7,
          'line-dasharray': [2, 1]
        }}
        filter={[
          'all',
          ['==', ['get', 'group'], 'TWR'],
          ['>=', ['zoom'], 7]
        ]}
      />
      <Layer
        id="airspace-borders-norway-app"
        type="line"
        paint={{
          'line-color': '#0099cc',
          'line-width': 0.7,
          'line-dasharray': [2, 1]
        }}
        filter={[
          'all',
          ['==', ['get', 'group'], 'APP'],
          ['>=', ['zoom'], 6],
          ['<', ['zoom'], 7.5]
        ]}
      />

      <Layer
        id="tma-labels-norway"
        type="symbol"
        layout={{
          'text-field': [
            'case', 
            ['==', ['get', 'group'], 'APP'], 
            ['get', 'id'], 
            ''
          ],
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

      <Layer
        id="sectors-labels-norway"
        type="symbol"
        layout={{
          'text-field': [
            'case', 
            ['==', ['get', 'group'], 'ACC'], 
            ['get', 'id'], 
            ''
          ],
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
  );
};

export { Sweden, Norway };
