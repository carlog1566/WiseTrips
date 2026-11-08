export type TripPreferencesCreate = {
  destination: string;
  trip_date: string;
  starting_location: string;
  start_time: string;
  end_time: string;
  budget: number;
  transportation_mode: string;
  interests: string[];
  pace: string;
};

export type Place = {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  rating?: number | null;
  estimated_cost: number;
};

export type ItineraryStop = {
  id: number;
  trip_id: number;
  place_id: number;
  stop_order: number;
  arrival_time: string;
  departure_time: string;
};

export type ItineraryResponse = {
  stops: ItineraryStop[];
  total_travel_minutes: number;
};
