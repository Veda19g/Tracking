import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';

import L from 'leaflet';
import { io } from 'socket.io-client';
import axios from 'axios';
import polyline from 'polyline';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const JoinRoom = () => {
  const isCreator = false;
  const { roomId } = useParams();
  const [route, setRoute] = useState([]);
  const [creatorLocation, setCreatorLocation] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('https://tracking-m78q.onrender.com');
    setSocket(newSocket);

    newSocket.on('roomData', (data) => {
      setRoute(data.route);
      setCreatorLocation(data.creatorLocation);
    });

    newSocket.on('locationUpdate', (data) => {
      setCreatorLocation(data.location);
    });

    return () => newSocket.disconnect();
  }, []);

  
  



  

  const joinRoom = () => {
    if (socket && roomId) {
      socket.emit('joinRoom', roomId);
    } else {
      alert('Please enter a Room ID');
    }
  };

  useEffect(() => {
    if (!isCreator || !navigator.geolocation) return;

    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCreatorLocation({ lat: latitude, lng: longitude });
          if (socket) {
            socket.emit('updateLocation', { roomId, location: { lat: latitude, lng: longitude } });
          }
        },
        (err) => {
          console.error('Error getting location:', err);
        },
        { enableHighAccuracy: true }
      );
    };

    updateLocation();
    const interval = setInterval(updateLocation, 5000);

    return () => clearInterval(interval);
  }, [socket, roomId, isCreator]);

  return (
    <div className="flex flex-col h-screen">
      <h1 className="text-3xl font-bold text-center py-4 bg-blue-600 text-white shadow-lg">
        Live Location Tracking
      </h1>

      <div>

        {!isCreator && (
          <div className="flex gap-4 col-span-full justify-center">
            <button
              onClick={joinRoom}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md transition"
            >
              Track Your Vehicle
            </button>
          </div> 
        )}

      </div>

      {/* Map Container */}
      <div className="flex-grow">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full rounded-lg shadow-md">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {route.length > 0 && <Polyline positions={route} color="blue" />}
          {creatorLocation && (
            <Marker position={[creatorLocation.lat, creatorLocation.lng]}>
              <Popup>Creator's Live Location</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default JoinRoom;
