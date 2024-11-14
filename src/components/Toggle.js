import React, { useState, useEffect, useCallback } from 'react';
import '../App.css';

const layerVisibility = {
  'Planned ACC Sectorization': ['sectors-fill'],
  'tma': ['tma-lines2', 'tma-labels2'],
  'routes': ['route-lines'],
};

const Toggle = ({ mapRef }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [layerStates, setLayerStates] = useState(() => {
    const savedState = localStorage.getItem('layerStates');
    return savedState ? JSON.parse(savedState) : {
      'Planned ACC Sectorization': true,
      'tma': true,
      'routes': true,
    };
  });

  const updateLayerVisibility = useCallback(() => {
    let map = mapRef;
    if (!map) return;

    Object.keys(layerStates).forEach(layerGroup => {
      const visibility = layerStates[layerGroup] ? 'visible' : 'none';
      layerVisibility[layerGroup].forEach(layerId => {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', visibility);
        } else {
          console.error(`Layer ${layerId} does not exist`);
        }
      });
    });

    // Save the updated state
    localStorage.setItem('layerStates', JSON.stringify(layerStates));
  }, [layerStates, mapRef]);

  useEffect(() => {
    updateLayerVisibility();
  }, [updateLayerVisibility]);

  useEffect(() => {
    let map = mapRef;
    if (map) {
      const handleMapLoad = () => {
        console.log('Map loaded');
        updateLayerVisibility();
      };

      if (map.isStyleLoaded()) {
        handleMapLoad();
      } else {
        map.on('load', handleMapLoad);
        return () => {
          map.off('load', handleMapLoad);
        };
      }
    } else {
      console.error('Map instance is not defined');
    }
  }, [mapRef, updateLayerVisibility]);

  const handleToggle = (layerGroup) => {
    setLayerStates(prev => ({
      ...prev,
      [layerGroup]: !prev[layerGroup],
    }));
  };

  return (
    <div className="toggle-container">
      <button className="cogwheel-button" onClick={() => setIsOpen(!isOpen)}>
        <img src="img/setup.png" alt="Settings" />
      </button>

      {isOpen && (
        <div className="toggle-panel">
          <ul>
            {Object.keys(layerVisibility).map(layerGroup => (
              <li key={layerGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={layerStates[layerGroup] || false}
                    onChange={() => handleToggle(layerGroup)}
                  />
                  {layerGroup.charAt(0).toUpperCase() + layerGroup.slice(1)}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Toggle;
