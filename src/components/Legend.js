import React, { useState } from 'react';
import '../App.css'; 

const Legend = () => {
  // State to control legend visibility
  const [isVisible, setIsVisible] = useState(false);

  // Toggle visibility
  const toggleLegend = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="legend-container">
      {/* Button to toggle the legend visibility */}
      <button className="legend-toggle-btn" onClick={toggleLegend}>
        ?
      </button>

      {/* Conditionally render the legend */}
      {isVisible && (
        <div id="map-legend" className="legend">
          {/* Close Button */}
          <button className="legend-close-btn" onClick={toggleLegend}>x</button>
          
          <h4>Airspace Border Colors</h4>
          <div className="legend-item">
            <div className="legend-icon-airspace" style={{ backgroundColor: '#006400' }}></div>
            <div className="legend-description">FIR:s</div>
          </div>
          <div className="legend-item">
            <div className="legend-icon-airspace" style={{ backgroundColor: '#666666' }}></div>
            <div className="legend-description">Area Control (CTA/FIS)</div>
          </div>
          <div className="legend-item">
            <div className="legend-icon-airspace" style={{ backgroundColor: '#0099cc' }}></div>
            <div className="legend-description">Upper (TMA/TIA)</div>
          </div>
          <div className="legend-item">
            <div className="legend-icon-airspace" style={{ backgroundColor: '#00cc99' }}></div>
            <div className="legend-description">Lower (CTR/FIZ)</div>
          </div>
          <h4>Routes (clickable)</h4>
          <div className="legend-item">
            <div className="legend-icon" style={{ color: '#ff4000' }}>---</div>
            <div className="legend-description">EFRO Mandatory Routes</div>
          </div>
          <div className="legend-item">
            <div className="legend-icon" style={{ color: '#00bfff' }}>---</div>
            <div className="legend-description">ESNQ Mandatory Routes</div>
          </div>
          <div className="legend-item">
            <div className="legend-icon" style={{ color: '#00ff40' }}>---</div>
            <div className="legend-description">ENTC Mandatory Routes</div>
          </div>
          <div className="legend-item">
            <div className="legend-icon" style={{ color: 'white' }}>---</div>
            <div className="legend-description">EFRO DEP towards Sweden</div>
          </div>
          <div className="legend-item">
            <div className="legend-icon" style={{ color: 'yellow' }}>[H]</div>
            <div className="legend-description">Reserved En-route hold<br />Click for hold instructions</div>
          </div>
          <div className="legend-item">
            <div className="legend-icon" style={{ color: 'white' }}>arc</div>
            <div className="legend-description">Latest Transfer Point</div>
          </div>
          <h4>Arriving Traffic Colors</h4>
          <div className="legend-item">
            <div className="legend-icon" style={{ color: 'white' }}>
              <img src="/img/tfc-efro.png" style={{ maxWidth: '20px' }} alt="EFRO Arrivals" />
            </div>
            <div className="legend-description">EFRO Arrivals</div>
          </div>
          <div className="legend-item">
            <div className="legend-icon" style={{ color: 'white' }}>
              <img src="/img/tfc-esnq.png" style={{ maxWidth: '20px' }} alt="ESNQ Arrivals" />
            </div>
            <div className="legend-description">ESNQ Arrivals</div>
          </div>
          <div className="legend-item">
            <div className="legend-icon" style={{ color: 'white' }}>
              <img src="/img/tfc-entc.png" style={{ maxWidth: '20px' }} alt="ENTC Arrivals" />
            </div>
            <div className="legend-description">ENTC Arrivals</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Legend;
