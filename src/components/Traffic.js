import React, { useEffect, useState } from 'react';
import { Source, Layer, Popup, useMap } from 'react-map-gl';
import * as turf from '@turf/turf';
import { VALID_ROUTES } from '../utils/utils';
import styled, { keyframes, useTheme } from 'styled-components';

const TRAFFIC_URL = 'https://data.vatsim.net/v3/vatsim-data.json';
const REFRESH_INTERVAL = 10000;

const airports = [
  { code: 'EFRO', icon: '/img/tfc-efro.png', name: 'EFRO', coords: [25.8476, 66.5608] },
  { code: 'ESNQ', icon: '/img/tfc-esnq.png', name: 'ESNQ', coords: [20.3718, 67.8550] },
  { code: 'ENTC', icon: '/img/tfc-entc.png', name: 'ENTC', coords: [18.9113, 69.6820] } 
];

const wobble = keyframes`
  0% { transform: rotate(0deg); }
  15% { transform: rotate(15deg); }
  30% { transform: rotate(-10deg); }
  45% { transform: rotate(5deg); }
  60% { transform: rotate(-5deg); }
  75% { transform: rotate(2deg); }
  100% { transform: rotate(0deg); }
`;

const ImageWrapper = styled.img`
  h2:hover & {
    animation: ${wobble} 1s ease-in-out;
  }
`;

const Traffic = () => {
  const [trafficData, setTrafficData] = useState([]);
  const [popupInfo, setPopupInfo] = useState(null);
  const [airportToggles, setAirportToggles] = useState({
    EFRO: true, ESNQ: true, ENTC: true
  });
  const [trafficCount, setTrafficCount] = useState({ EFRO: 0, ESNQ: 0, ENTC: 0 });
  const [nextHourTraffic, setNextHourTraffic] = useState({ EFRO: 0, ESNQ: 0, ENTC: 0 });

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


  
        // Coordinates for EFRO, ENSQ, ENTC
        const nextHourStats = {
          EFRO: calculateNextHourTraffic('EFRO', airports.find(a => a.code === 'EFRO').coords),
          ESNQ: calculateNextHourTraffic('ESNQ', airports.find(a => a.code === 'ESNQ').coords),
          ENTC: calculateNextHourTraffic('ENTC', airports.find(a => a.code === 'ENTC').coords)
        };
  
        // Set traffic counts for each airport
        setTrafficCount({
          EFRO: filteredData.filter(pilot => pilot.flight_plan.arrival === 'EFRO').length,
          ESNQ: filteredData.filter(pilot => pilot.flight_plan.arrival === 'ESNQ').length,
          ENTC: filteredData.filter(pilot => pilot.flight_plan.arrival === 'ENTC').length
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
        const isInvalidRoute = pilot.flight_plan.arrival === 'EFRO' && !VALID_ROUTES.some(route => pilot.flight_plan.route.includes(route));
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
      const { routeStatus, altitude, groundspeed, departure, arrival, route } = feature.properties;

      const flightLevel = altitude >= 5000 ? 'FL' + Math.round(altitude / 100) : altitude + ' FT';
      const skyvectorLink = `https://skyvector.com/?fpl=${departure}%20${route.split(' ').join('%20')}%20${arrival}`;

      setPopupInfo({
        coordinates,
        routeStatus,
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
            <span className='traffic-count'>{trafficCount[airport.code]}</span> &emsp;
            <span>({nextHourTraffic[airport.code]} ops/h)</span>
          </div>
        ))}
        <p className='hide-label'>
          Click to hide traffic &ensp;
          <img src={'/img/arrow-up.png'} style={{ maxWidth: '11px' }} alt={`↑`} />
        </p>
        <h2 className="fss-title" onClick={() => window.open('https://fss.vatsim-scandinavia.org/', '_blank')} >
          Fly and See Santa 2024
          <ImageWrapper src="/img/fss-hat.png"></ImageWrapper>
        </h2>
      </div>

      <Source id="traffic" type="geojson" data={trafficGeoJson}>
        <Layer
          id="traffic-icons"
          type="symbol"
          layout={{
            'icon-image': [
              'case',
              ['==', ['get', 'arrival'], 'EFRO'], 'tfc-efro',
              ['==', ['get', 'arrival'], 'ESNQ'], 'tfc-esnq',
              ['==', ['get', 'arrival'], 'ENTC'], 'tfc-entc',
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
            'text-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              4.99, 0,
              5, 1
            ],
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
            <strong>{popupInfo.routeStatus}</strong><br />
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
