import axios from 'axios';

/**
 * Flight API Service for real-time flight data integration
 *
 * Supported APIs:
 * 1. Aviationstack (https://aviationstack.com) - Best for beginners, 100 free requests/month
 * 2. FlightAware AeroAPI (https://www.flightaware.com/commercial/aeroapi/)
 * 3. Amadeus (https://developers.amadeus.com) - Enterprise solution
 *
 * This service provides a framework for integrating real-time flight data.
 * Configure via environment variables.
 */

interface FlightSearchParams {
  departure_airport: string;
  arrival_airport: string;
  departure_date: string;
}

interface RealTimeFlightData {
  flight_number: string;
  airline: {
    code: string;
    name: string;
  };
  departure: {
    airport: string;
    scheduled_time: string;
    actual_time?: string;
    terminal?: string;
    gate?: string;
  };
  arrival: {
    airport: string;
    scheduled_time: string;
    actual_time?: string;
    terminal?: string;
    gate?: string;
  };
  status: string;
  aircraft?: string;
  duration?: number;
}

class FlightAPIService {
  private apiProvider: string;
  private apiKey: string;
  private isConfigured: boolean = false;

  constructor() {
    this.apiProvider = process.env.FLIGHT_API_PROVIDER || 'aviationstack';
    this.apiKey = process.env.FLIGHT_API_KEY || '';
    this.isConfigured = !!this.apiKey;

    if (!this.isConfigured) {
      console.log('⚠️  Real-time flight API not configured');
      console.log('   To enable: Set FLIGHT_API_PROVIDER and FLIGHT_API_KEY environment variables');
    } else {
      console.log(`✅ Real-time flight API initialized (${this.apiProvider})`);
    }
  }

  /**
   * Search for real-time flights using external API
   */
  async searchFlights(params: FlightSearchParams): Promise<RealTimeFlightData[]> {
    if (!this.isConfigured) {
      console.log('⚠️  Real-time API not configured, using database only');
      return [];
    }

    try {
      switch (this.apiProvider) {
        case 'aviationstack':
          return await this.searchAviationstack(params);
        case 'amadeus':
          return await this.searchAmadeus(params);
        case 'flightaware':
          return await this.searchFlightAware(params);
        default:
          console.warn(`Unknown API provider: ${this.apiProvider}`);
          return [];
      }
    } catch (error: any) {
      console.error('Flight API error:', error.message);
      return [];
    }
  }

  /**
   * Get real-time status for a specific flight
   */
  async getFlightStatus(flightNumber: string, date: string): Promise<RealTimeFlightData | null> {
    if (!this.isConfigured) {
      return null;
    }

    try {
      switch (this.apiProvider) {
        case 'aviationstack':
          return await this.getAviationstackStatus(flightNumber, date);
        case 'amadeus':
          return await this.getAmadeusStatus(flightNumber, date);
        case 'flightaware':
          return await this.getFlightAwareStatus(flightNumber, date);
        default:
          return null;
      }
    } catch (error: any) {
      console.error('Flight status error:', error.message);
      return null;
    }
  }

  // ============================================================================
  // Aviationstack Implementation
  // Free tier: 100 requests/month
  // Docs: https://aviationstack.com/documentation
  // ============================================================================

  private async searchAviationstack(params: FlightSearchParams): Promise<RealTimeFlightData[]> {
    const url = 'http://api.aviationstack.com/v1/flights';

    const response = await axios.get(url, {
      params: {
        access_key: this.apiKey,
        dep_iata: params.departure_airport,
        arr_iata: params.arrival_airport,
        flight_date: params.departure_date,
        limit: 50,
      },
    });

    if (!response.data.data) {
      return [];
    }

    return response.data.data.map((flight: any) => ({
      flight_number: flight.flight.iata,
      airline: {
        code: flight.airline.iata,
        name: flight.airline.name,
      },
      departure: {
        airport: flight.departure.iata,
        scheduled_time: flight.departure.scheduled,
        actual_time: flight.departure.actual,
        terminal: flight.departure.terminal,
        gate: flight.departure.gate,
      },
      arrival: {
        airport: flight.arrival.iata,
        scheduled_time: flight.arrival.scheduled,
        actual_time: flight.arrival.actual,
        terminal: flight.arrival.terminal,
        gate: flight.arrival.gate,
      },
      status: flight.flight_status,
      aircraft: flight.aircraft?.registration,
      duration: flight.flight_duration,
    }));
  }

  private async getAviationstackStatus(flightNumber: string, date: string): Promise<RealTimeFlightData | null> {
    const url = 'http://api.aviationstack.com/v1/flights';

    const response = await axios.get(url, {
      params: {
        access_key: this.apiKey,
        flight_iata: flightNumber,
        flight_date: date,
        limit: 1,
      },
    });

    if (!response.data.data || response.data.data.length === 0) {
      return null;
    }

    const flight = response.data.data[0];
    return {
      flight_number: flight.flight.iata,
      airline: {
        code: flight.airline.iata,
        name: flight.airline.name,
      },
      departure: {
        airport: flight.departure.iata,
        scheduled_time: flight.departure.scheduled,
        actual_time: flight.departure.actual,
        terminal: flight.departure.terminal,
        gate: flight.departure.gate,
      },
      arrival: {
        airport: flight.arrival.iata,
        scheduled_time: flight.arrival.scheduled,
        actual_time: flight.arrival.actual,
        terminal: flight.arrival.terminal,
        gate: flight.arrival.gate,
      },
      status: flight.flight_status,
      aircraft: flight.aircraft?.registration,
    };
  }

  // ============================================================================
  // Amadeus Implementation (Placeholder)
  // Enterprise solution with OAuth2 authentication
  // Docs: https://developers.amadeus.com
  // ============================================================================

  private async searchAmadeus(params: FlightSearchParams): Promise<RealTimeFlightData[]> {
    // TODO: Implement Amadeus flight search
    // 1. Get OAuth2 token
    // 2. Call Flight Offers Search API
    // 3. Transform response to RealTimeFlightData format
    console.log('Amadeus integration not yet implemented');
    return [];
  }

  private async getAmadeusStatus(flightNumber: string, date: string): Promise<RealTimeFlightData | null> {
    // TODO: Implement Amadeus flight status
    console.log('Amadeus integration not yet implemented');
    return null;
  }

  // ============================================================================
  // FlightAware AeroAPI Implementation (Placeholder)
  // Professional flight tracking
  // Docs: https://www.flightaware.com/commercial/aeroapi/
  // ============================================================================

  private async searchFlightAware(params: FlightSearchParams): Promise<RealTimeFlightData[]> {
    // TODO: Implement FlightAware flight search
    console.log('FlightAware integration not yet implemented');
    return [];
  }

  private async getFlightAwareStatus(flightNumber: string, date: string): Promise<RealTimeFlightData | null> {
    // TODO: Implement FlightAware flight status
    console.log('FlightAware integration not yet implemented');
    return null;
  }
}

export default new FlightAPIService();
