import React, { useEffect, useState } from 'react';
import { FaRegBuilding } from "react-icons/fa";

const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; 
  const φ1 = (lat1 * Math.PI) / 180; 
  const φ2 = (lat2 * Math.PI) / 180; 
  const Δφ = ((lat2 - lat1) * Math.PI) / 180; 
  const Δλ = ((lon2 - lon1) * Math.PI) / 180; 

  const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; 
};

const Acesso = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [message, setMessage] = useState('');
  const [isLocked, setIsLocked] = useState(false); 

  const locations = [
    { id: 1, name: 'Anhanguera, Teixeira de Freitas - BA', latitude: -17.550740705759743, longitude: -39.7235416959505  },
    { id: 2, name: 'Anhanguera, Camaçari - BA', latitude:  -12.711083328795038, longitude: -38.30701252393009 },
    { id: 3, name: 'Anhanguera, Caruaru - BA', latitude:  -8.282379915967674, longitude: -35.96760826358396 },
    { id: 4, name: 'Anhanguera, Feira de Santana - BA', latitude:  -12.243717088492133, longitude: -38.963916509424145 },
    { id: 5, name: 'Anhanguera, Fortaleza - CE', latitude: 0, longitude: 0 },
    { id: 6, name: 'Anhanguera, Imperatriz - MA', latitude: -5.522885939111842, longitude: -47.48509220401758 },
    { id: 7, name: 'Anhanguera, Jequie - BA', latitude:  -13.862683353775592, longitude: -40.09569446276788 },
    { id: 8, name: 'Anhanguera, Maceio - AL', latitude:  -9.560585555276035, longitude: -35.74489900961917 },
    { id: 9, name: 'Anhanguera - Iguatemi, Salvador - BA', latitude: -12.980132216575832, longitude: -38.47097242967175 },
    { id: 10, name: 'Unime Anhanguera - Paralela, Salvador - BA', latitude: -12.936692066718859, longitude: -38.3945919816151 }, 
    { id: 11, name: 'Anhanguera, Santo Antonio de Jesus - BA', latitude:  -12.965882440385107, longitude: -39.26406397048434  },
    { id: 12, name: 'Anhanguera, São Luís - MA', latitude: -2.5309225347365594, longitude: -44.22512597865192 },
    { id: 13, name: 'Anhanguera, Sobral - CE', latitude:  -3.698821196120959, longitude: -40.34814242829021 },
    { id: 14, name: 'Anhanguera, Vitoria da Conquista - BA', latitude:  -14.891589864384246, longitude: -40.845390966730804 },
  ];

  useEffect(() => {
      navigator.geolocation.getCurrentPosition(
          (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation({ latitude, longitude });
          },
          (error) => {
              setMessage('Erro ao obter a localização.');
          }
      );
  }, []);

  useEffect(() => {
    let timeoutId;
    if (userLocation) {
      const { latitude, longitude } = userLocation;
      const radius = 1250; 
      const nearby = locations.find((loc) =>
        getDistanceFromLatLonInMeters(latitude, longitude, loc.latitude, loc.longitude) <= radius
      );

      if (nearby) {
        setMessage(`${nearby.name}`);
        setIsLocked(false); 
      } else {
        setMessage('Você está longe demais de todas as localizações.');
        setIsLocked(true); 
        timeoutId = setTimeout(() => {
          window.close();
        }, 3000);
      }
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [userLocation]);

  return (
    <div>
        <p className='localizacao2'><FaRegBuilding /> <span>Unidade:  <span>{message}</span></span></p>
    </div>
  );
};

export default Acesso;
