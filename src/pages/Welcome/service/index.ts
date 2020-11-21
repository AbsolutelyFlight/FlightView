import request from '@/utils/request';

const baseUrl = BASE_URL;

console.log('baseUrl', baseUrl);

// localhost:8080/flights/89414de8-f9f7-41d9-83fa-5ea6be5a9eef
export async function fetchFlightDetail(flight: string) {
  console.log('flight', flight);
  return request(`${baseUrl}/flights/${flight}`);
}
