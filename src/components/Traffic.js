import React, { useEffect, useState } from 'react';
import { Source, Layer, Popup, useMap } from 'react-map-gl';
import * as turf from '@turf/turf';
import { VALID_ROUTES } from '../utils/utils';

const TRAFFIC_URL = 'https://data.vatsim.net/v3/vatsim-data.json';
const REFRESH_INTERVAL = 10000;

const airports = [
  { code: 'EFHK', icon: '/img/tfc-efro.png', name: 'EFRO', coords: [24.9634, 60.3172] },
  { code: 'ESSA', icon: '/img/tfc-esnq.png', name: 'ESNQ', coords: [17.923, 59.6519] },
  { code: 'ENGM', icon: '/img/tfc-entc.png', name: 'ENTC', coords: [11.099, 60.2028] },
];

const Traffic = () => {
  const [trafficData, setTrafficData] = useState([]);
  const [popupInfo, setPopupInfo] = useState(null);
  const [airportToggles, setAirportToggles] = useState({
    EFHK: true, ESSA: true, ENGM: true
  });
  const [trafficCount, setTrafficCount] = useState({ EFHK: 0, ESSA: 0, ENGM: 0 });
  const [nextHourTraffic, setNextHourTraffic] = useState({ EFHK: 0, ESSA: 0, ENGM: 0 });

  const { current: map } = useMap();

  useEffect(() => {
    const fetchTrafficData = async () => {
      try {
        const response = await fetch(TRAFFIC_URL);
        const data = await response.json();
  
        // Filter traffic based on arrival airports
        const filteredData = data.pilots.filter(pilot => 
          pilot.flight_plan && airports.some(airport => airport.code === pilot.flight_plan.arrival)
        );
  
        setTrafficData(filteredData);
  
        // Calculate how many aircraft are within 10-420 NM from each airport
        const calculateNextHourTraffic = (airportCode, coords) => {
          return filteredData.filter(pilot => {
            const pilotPoint = turf.point([pilot.longitude, pilot.latitude]); // [longitude, latitude]
            const airportPoint = turf.point(coords); // Ensure coords are in [longitude, latitude] format
            
            const fromAirport = turf.distance(pilotPoint, airportPoint, { units: 'nauticalmiles' });

            // Check if within 10-420 NM and aircraft is in the air
            return fromAirport >= 10 && fromAirport <= 420 && pilot.groundspeed > 10 && pilot.flight_plan.arrival === airportCode;
          }).length;
        };


  
        // Coordinates for EFHK, ESSA, ENGM
        const nextHourStats = {
          EFHK: calculateNextHourTraffic('EFHK', airports.find(a => a.code === 'EFHK').coords),
          ESSA: calculateNextHourTraffic('ESSA', airports.find(a => a.code === 'ESSA').coords),
          ENGM: calculateNextHourTraffic('ENGM', airports.find(a => a.code === 'ENGM').coords)
        };
  
        // Set traffic counts for each airport
        setTrafficCount({
          EFHK: filteredData.filter(pilot => pilot.flight_plan.arrival === 'EFHK').length,
          ESSA: filteredData.filter(pilot => pilot.flight_plan.arrival === 'ESSA').length,
          ENGM: filteredData.filter(pilot => pilot.flight_plan.arrival === 'ENGM').length
        });
  
        // Set traffic expected in the next hour for each airport
        setNextHourTraffic(nextHourStats);
        
      } catch (error) {
        console.error('Error fetching traffic data:', error);
      }
    };
  
    fetchTrafficData(); // Initial load
    const intervalId = setInterval(fetchTrafficData, REFRESH_INTERVAL); // Refresh every 10 seconds
  
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);
  

  const toggleAirportTraffic = (airportCode) => {
    setAirportToggles({
      ...airportToggles,
      [airportCode]: !airportToggles[airportCode]
    });
  };

  const trafficGeoJson = {
    type: 'FeatureCollection',
    features: trafficData
      .filter(pilot => airportToggles[pilot.flight_plan.arrival])
      .map(pilot => {
        const isInvalidRoute = pilot.flight_plan.arrival === 'EFHK' && !VALID_ROUTES.some(route => pilot.flight_plan.route.includes(route));
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [pilot.longitude, pilot.latitude]
          },
          properties: {
            id: pilot.cid,
            callsign: pilot.callsign,
            altitude: pilot.altitude,
            groundspeed: pilot.groundspeed,
            heading: pilot.heading,
            departure: pilot.flight_plan.departure,
            arrival: pilot.flight_plan.arrival,
            route: pilot.flight_plan.route,
            routeStatus: isInvalidRoute ? `${pilot.callsign}\ncheck route` : pilot.callsign,
          }
        }
      })
  };

  useEffect(() => {
    if (!map) return;

    const handleTrafficClick = (event) => {
      const features = map.queryRenderedFeatures(event.point, { layers: ['traffic-icons'] });
      if (!features.length) return;

      const feature = features[0];
      const coordinates = feature.geometry.coordinates.slice();
      const { callsign, altitude, groundspeed, departure, arrival, route } = feature.properties;

      const flightLevel = altitude >= 5000 ? 'FL' + Math.round(altitude / 100) : altitude + ' FT';
      const skyvectorLink = `https://skyvector.com/?fpl=${departure}%20${route.split(' ').join('%20')}%20${arrival}`;

      setPopupInfo({
        coordinates,
        callsign,
        flightLevel,
        groundspeed,
        skyvectorLink,
        route,
        departure,
        arrival,
      });
    };

    map.on('click', handleTrafficClick);
    map.on('mouseenter', 'traffic-icons', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'traffic-icons', () => {
      map.getCanvas().style.cursor = '';
    });

    return () => {
      map.off('click', handleTrafficClick);
      map.off('mouseenter', 'traffic-icons');
      map.off('mouseleave', 'traffic-icons');
    };
  }, [map, trafficData]);

  const closePopup = () => {
    setPopupInfo(null);
  };

  return (
    <>
      {/* Statistics Row */}
      <div className="traffic-stats-row">
        {airports.map(airport => (
          <div
            key={airport.code}
            className={`traffic-toggle ${!airportToggles[airport.code] ? 'disabled' : ''}`}
            onClick={() => toggleAirportTraffic(airport.code)}
          >
            <img src={airport.icon} style={{ maxWidth: '24px' }} alt={`${airport.name} Arrivals`} />
            <span><b>{trafficCount[airport.code]}</b></span> &emsp;
            <span>next hour: {nextHourTraffic[airport.code]}</span>
          </div>
        ))}
        <p className='hide-label'>
          Click to hide traffic &ensp;
          <img src={'/img/arrow-up.png'} style={{ maxWidth: '11px' }} alt={`↑`} />
        </p>
      </div>

      <Source id="traffic" type="geojson" data={trafficGeoJson}>
        <Layer
          id="traffic-icons"
          type="symbol"
          layout={{
            'icon-image': [
              'case',
              ['==', ['get', 'arrival'], 'EFHK'], 'tfc-efro',
              ['==', ['get', 'arrival'], 'ESSA'], 'tfc-esnq',
              ['==', ['get', 'arrival'], 'ENGM'], 'tfc-entc',
              'default-icon'
            ],
            'icon-rotation-alignment': 'map',
            'icon-rotate': ['get', 'heading'],
            'icon-size': 0.32,
            'icon-allow-overlap': true,
            'text-field': ['get', 'routeStatus'],
            'text-font': ['Open Sans Regular'],
            'text-size': 11,
            'text-anchor': 'left',
            'text-offset': [1.2, 0],
            'icon-allow-overlap': true,
            'text-allow-overlap': true,
            'text-justify': 'left'
          }}
          paint={{
            'text-color': 'white',
            'text-halo-color': '#000000',
            'text-halo-width': 0.6,
          }}
        />
      </Source>

      {popupInfo && (
        <Popup
          longitude={popupInfo.coordinates[0]}
          latitude={popupInfo.coordinates[1]}
          closeOnClick={false}
          onClose={closePopup}
          anchor="top"
        >
          <div>
            <strong>{popupInfo.callsign}</strong><br />
            <span>{popupInfo.flightLevel} {popupInfo.groundspeed} kt</span><br />
            <span>
              <a href={popupInfo.skyvectorLink} target="_blank" rel="noopener noreferrer">Open in SkyVector</a>
            </span><br />
            <a href="#" id="copyRouteButton" onClick={() => {
              navigator.clipboard.writeText(`${popupInfo.departure} ${popupInfo.route} ${popupInfo.arrival}`);
            }}>
              Copy Route
            </a>
          </div>
        </Popup>
      )}
    </>
  );
};

export default Traffic;
