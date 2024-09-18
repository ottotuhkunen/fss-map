import React, { useEffect, useState, useRef } from 'react';
import { Source, Layer, useMap } from 'react-map-gl';
import { otherControllerColors} from '../utils/utils';

import swedenGeoJsonUrl from '../geofiles/sweden.geojson';
import norwayGeoJsonUrl from '../geofiles/norway.geojson';

const defaultColor = 'transparent'; // Default color

const ownersOnline = ['SK', 'SN', 'S3', 'S1', '1R', '5R', '6R', '18R', '24R', '26R', '17R'];

const getOwnerColor = (owners) => {
  if (!Array.isArray(owners)) {
    owners = [owners]; // Convert to array if it's a single string
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
    return geoJson; // Return invalid
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
  const { map } = useMap(); // Access the map instance

  useEffect(() => {
    mapRef.current = map; // Set the map instance to ref
  }, [map]);

  return mapRef;
};

const Sweden = () => {
  const [geoJson, setGeoJson] = useState(null);
  const hasLogged = useRef(false);
  const mapRef = useMapInstance();

  useEffect(() => {
    if (!hasLogged.current) {
      console.log("Sweden component mounted");
      hasLogged.current = true;
    }
    const loadGeoJson = async () => {
      const data = await fetchGeoJson(swedenGeoJsonUrl);
      setGeoJson(getProcessedGeoJson(data));
    };
    loadGeoJson();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      if (map.getLayer('airspace-fills-sweden')) {
        console.log('Sweden layers already present.');
        return; // Stop if layer already exists
      }

      // Add your layers here if they don't exist
      map.addLayer({
        id: 'airspace-fills-sweden',
        type: 'fill',
        source: 'sweden-source',
        paint: {
          'fill-color': [
            'match',
            ['get', 'group'],
            'TWR', 'transparent',
            'APP', 'transparent',
            'ACC', ['coalesce', ['get', 'color'], defaultColor],
            defaultColor
          ],
          'fill-opacity': 0.15,
        },
        filter: [
          'all',
          ['==', ['get', 'group'], 'ACC']
        ]
      });

      map.addLayer({
        id: 'airspace-borders-sweden',
        type: 'line',
        source: 'sweden-source',
        paint: {
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
        },
        filter: [
          'all',
          [
            'match',
            ['get', 'group'],
            'ACC', true,
            false
          ],
          ['<', ['zoom'], 6.5]
        ]
      });

      // Repeat for other layers...
    }
  }, [mapRef, geoJson]);

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
    </Source>
  );
};

const Norway = () => {
  const [geoJson, setGeoJson] = useState(null);
  const hasLogged = useRef(false);
  const mapRef = useMapInstance();

  useEffect(() => {
    if (!hasLogged.current) {
      console.log("Norway component mounted");
      hasLogged.current = true;
    }
    const loadGeoJson = async () => {
      const data = await fetchGeoJson(norwayGeoJsonUrl);
      setGeoJson(getProcessedGeoJson(data));
    };
    loadGeoJson();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      if (map.getLayer('airspace-fills-norway')) {
        console.log('Norway layers already present.');
        return; // Stop if layer already exists
      }

      // Add your layers here if they don't exist
      map.addLayer({
        id: 'airspace-fills-norway',
        type: 'fill',
        source: 'norway-source',
        paint: {
          'fill-color': [
            'match',
            ['get', 'group'],
            'TWR', 'transparent',
            'APP', 'transparent',
            'ACC', ['coalesce', ['get', 'color'], defaultColor],
            defaultColor
          ],
          'fill-opacity': 0.15,
        },
        filter: [
          'all',
          ['==', ['get', 'group'], 'ACC']
        ],
      });      

      map.addLayer({
        id: 'airspace-borders-norway-acc',
        type: 'line',
        source: 'norway-source',
        paint: {
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
        },
        filter: [
          'all',
          ['==', ['get', 'group'], 'ACC'],
          ['<', ['zoom'], 6.5]
        ],
      });

      // Repeat for other layers...
    }
  }, [mapRef, geoJson]);

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
    </Source>
  );
};

export { Sweden, Norway };
