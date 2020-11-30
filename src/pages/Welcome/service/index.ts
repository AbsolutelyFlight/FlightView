import request from '@/utils/request';

const baseUrl = BASE_URL;

export interface FlightItem {
  longitude: number,
  latitude: number,
  height: number
}

export interface FlightListItem {
  name: string,
  id: number,
  date: string
}

// localhost:8080/flights/89414de8-f9f7-41d9-83fa-5ea6be5a9eef
export async function fetchFlightDetail(flight: number) {
  return request(`${baseUrl}/flights/${flight}`);
}

export async function fetchFlights() {
  return request(`${baseUrl}/flights`);
}
