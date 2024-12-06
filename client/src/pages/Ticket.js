// src/components/Ticket.js
import React from 'react';
import './Ticket.css';

const Ticket = ({ ticketType, title, name, date, address, qrCode, id, type }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`ticket-container ${type === 'physical' ? 'ticket-physical' : 'ticket-digital'}`}>
      <div className="ticket-type">{ticketType}</div>
      <div className="ticket-content">
        <h2 className="ticket-title">{title}</h2>
        <div className="ticket-details">
          <div className="detail-item">
            <span>Name</span>
            <span className="value">{name}</span>
          </div>
          <div className="detail-item">
            <span>Date</span>
            <span className="value">{date}</span>
          </div>
        </div>
        <div className="ticket-address">
          <span>Event Address</span>
          <span className="address-value">{address}</span>
        </div>
      </div>
      <div className="ticket-qr">
        <img src={qrCode} alt="QR Code" />
        <span>ID {id}</span>
      </div>
      {type === 'physical' && (
        <button onClick={handlePrint} className="print-button">
          Print Ticket
        </button>
      )}
    </div>
  );
};

export default Ticket;
