import React from 'react';

export interface RoomData {
  id: number;
  number: number;
  floor: number;
  status: 'AVAILABLE' | 'BOOKED';
}

interface HotelGridProps {
  rooms: RoomData[];
  selectedRoomIds: number[];
}

export const HotelGrid: React.FC<HotelGridProps> = ({ rooms, selectedRoomIds }) => {
  // Group rooms by floor
  const floorsMap: { [key: number]: RoomData[] } = {};
  rooms.forEach((room) => {
    if (!floorsMap[room.floor]) floorsMap[room.floor] = [];
    floorsMap[room.floor].push(room);
  });

  const floors = Object.keys(floorsMap).map(Number).sort((a, b) => b - a); // Top floor first

  return (
    <div className="hotel-view glass-panel">
      <h2 style={{ marginBottom: '16px' }}>Hotel Overview</h2>
      
      {floors.map((floorNum) => (
        <div key={floorNum} className="floor">
          <div className="floor-label">Floor {floorNum}</div>
          <div className="stairs-lift">S/L</div>
          
          <div className="rooms-container">
            {floorsMap[floorNum].map((room) => {
              const isSelected = selectedRoomIds.includes(room.id);
              return (
                <div 
                  key={room.id} 
                  className={`room ${isSelected ? 'SELECTED' : room.status}`}
                  title={`Floor ${room.floor} | Room ${room.number} | Status: ${room.status}`}
                >
                  {room.number}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '24px', marginTop: '24px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="room AVAILABLE" style={{ width: '24px', height: '24px' }}></div>
          <span>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="room BOOKED" style={{ width: '24px', height: '24px' }}></div>
          <span>Booked</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="room SELECTED" style={{ width: '24px', height: '24px', animation: 'none' }}></div>
          <span>Just Booked</span>
        </div>
      </div>
    </div>
  );
};
