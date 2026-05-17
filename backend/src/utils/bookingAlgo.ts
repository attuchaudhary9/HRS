import { Room } from '../models';

export const calculateTravelTime = (selectedRooms: Room[]): number => {
  if (selectedRooms.length === 0) return 0;

  // Group rooms by floor and find the maximum room distance from stairs on each floor
  const floorMaxC: { [floor: number]: number } = {};
  
  selectedRooms.forEach(room => {
    // Room number convention: 101 -> floor 1, room index 1
    // Floor 10: 1001 -> floor 10, room index 1
    // But since we just need the relative index from the stairs, let's say index = room.number % 100.
    // E.g., room 105 -> index 5.
    const roomIndex = room.number % 100;
    if (!floorMaxC[room.floor]) {
      floorMaxC[room.floor] = roomIndex;
    } else {
      floorMaxC[room.floor] = Math.max(floorMaxC[room.floor], roomIndex);
    }
  });

  const floors = Object.keys(floorMaxC).map(Number).sort((a, b) => a - b);
  
  if (floors.length === 1) {
    // Single floor logic: max index - min index
    const floor = floors[0];
    const indices = selectedRooms.filter(r => r.floor === floor).map(r => r.number % 100);
    const maxIdx = Math.max(...indices);
    const minIdx = Math.min(...indices);
    return maxIdx - minIdx;
  }

  // Multi-floor logic
  const fMin = floors[0];
  const fMax = floors[floors.length - 1];

  let cost = 2 * (fMax - fMin); // Vertical travel time between extremum floors

  for (const floor of floors) {
    cost += 2 * floorMaxC[floor]; // Go from stairs to furthest room and back
  }

  // We don't need to go back to stairs on the first and last floor we visit
  cost -= floorMaxC[fMin];
  cost -= floorMaxC[fMax];

  return cost;
};

// Generate all combinations of size k from an array
export function* combinations<T>(arr: T[], k: number): Generator<T[]> {
  if (k === 0) {
    yield [];
    return;
  }
  if (arr.length === 0) {
    return;
  }
  const [head, ...tail] = arr;
  for (const c of combinations(tail, k - 1)) {
    yield [head, ...c];
  }
  for (const c of combinations(tail, k)) {
    yield c;
  }
}

export const findOptimalRooms = (availableRooms: Room[], numRoomsToBook: number): Room[] => {
  if (availableRooms.length < numRoomsToBook) {
    return []; // Not enough rooms
  }

  // Priority 1: Check if there's a single floor with enough rooms
  // Group available rooms by floor
  const roomsByFloor: { [floor: number]: Room[] } = {};
  availableRooms.forEach(room => {
    if (!roomsByFloor[room.floor]) roomsByFloor[room.floor] = [];
    roomsByFloor[room.floor].push(room);
  });

  let bestSingleFloorRooms: Room[] | null = null;
  let minSingleFloorTravelTime = Infinity;

  for (const floor in roomsByFloor) {
    const rooms = roomsByFloor[floor].sort((a, b) => a.number - b.number);
    if (rooms.length >= numRoomsToBook) {
      // Find the window of size numRoomsToBook with minimum travel time
      for (let i = 0; i <= rooms.length - numRoomsToBook; i++) {
        const windowRooms = rooms.slice(i, i + numRoomsToBook);
        const travelTime = calculateTravelTime(windowRooms);
        if (travelTime < minSingleFloorTravelTime) {
          minSingleFloorTravelTime = travelTime;
          bestSingleFloorRooms = windowRooms;
        }
      }
    }
  }

  if (bestSingleFloorRooms) {
    return bestSingleFloorRooms; // Return the best single-floor combination
  }

  // Priority 2: Span across floors minimizing total travel time
  let bestMultiFloorRooms: Room[] = [];
  let minMultiFloorTravelTime = Infinity;

  const combos = combinations(availableRooms, numRoomsToBook);
  for (const combo of combos) {
    const travelTime = calculateTravelTime(combo);
    if (travelTime < minMultiFloorTravelTime) {
      minMultiFloorTravelTime = travelTime;
      bestMultiFloorRooms = combo;
    }
  }

  return bestMultiFloorRooms;
};
