import axios from 'axios'
import { destinations as fallbackDestinations } from '../data/destinations'

// API configurations
const AMADEUS_API_KEY = import.meta.env.VITE_AMADEUS_API_KEY
const AMADEUS_API_SECRET = import.meta.env.VITE_AMADEUS_API_SECRET
const AMADEUS_BASE_URL = 'https://test.api.amadeus.com/v1'

// Google Places API configuration
const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
const GOOGLE_PLACES_BASE_URL = 'https://places.googleapis.com/v1'

let accessToken = null
let tokenExpiry = null

// Get Amadeus access token
const getAccessToken = async () => {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken
  }

  try {
    const response = await axios.post(
      'https://test.api.amadeus.com/v1/security/oauth2/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: AMADEUS_API_KEY,
        client_secret: AMADEUS_API_SECRET
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    )

    accessToken = response.data.access_token
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000 // Refresh 1 min before expiry
    return accessToken
  } catch (error) {
    console.error('Failed to get Amadeus access token:', error)
    throw error
  }
}

// Fetch destinations from Amadeus API
export const fetchDestinationsFromAPI = async (searchTerm = '', continent = 'All', page = 1, limit = 24) => {
  // If no API keys configured, use fallback data
  if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
    console.warn('Amadeus API keys not configured. Using fallback data.')
    return useFallbackData(searchTerm, continent, page, limit)
  }

  try {
    const token = await getAccessToken()

    // Use Amadeus Points of Interest API
    const response = await axios.get(`${AMADEUS_BASE_URL}/shopping/activities`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        latitude: getDefaultLatitude(continent),
        longitude: getDefaultLongitude(continent),
        radius: 100
      }
    })

    // Transform Amadeus data to our format
    const destinations = transformAmadeusData(response.data.data || [])

    // Apply filters
    return filterAndPaginateDestinations(destinations, searchTerm, continent, page, limit)
  } catch (error) {
    console.error('Error fetching from Amadeus API:', error)
    // Fallback to static data on error
    return useFallbackData(searchTerm, continent, page, limit)
  }
}

// Transform Amadeus API response to our destination format
const transformAmadeusData = (amadeusData) => {
  return amadeusData.map((item, index) => ({
    id: item.id || `api-${index}`,
    name: item.name,
    country: item.geoCode?.country || 'Unknown',
    continent: 'Various', // Amadeus doesn't provide continent directly
    rating: item.rating ? parseFloat(item.rating) : 4.5,
    reviews: Math.floor(Math.random() * 10000) + 1000,
    averageCost: item.price?.amount ? parseInt(item.price.amount) : 150,
    currency: item.price?.currency || 'USD',
    image: item.pictures?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828',
    description: item.shortDescription || item.description || 'Discover this amazing destination',
    coordinates: {
      lat: item.geoCode?.latitude || 0,
      lng: item.geoCode?.longitude || 0
    },
    topAttractions: [],
    bestTimeToVisit: 'Year-round',
    languages: ['English'],
    weatherInfo: 'Pleasant weather',
    visaRequired: false,
    popularActivities: item.tags || []
  }))
}

// Get default coordinates for each continent
const getDefaultLatitude = (continent) => {
  const coords = {
    'Europe': 48.8566,
    'Asia': 35.6762,
    'North America': 40.7128,
    'South America': -23.5505,
    'Africa': -1.2921,
    'Oceania': -33.8688,
    'All': 48.8566
  }
  return coords[continent] || coords['All']
}

const getDefaultLongitude = (continent) => {
  const coords = {
    'Europe': 2.3522,
    'Asia': 139.6503,
    'North America': -74.0060,
    'South America': -46.6333,
    'Africa': 36.8219,
    'Oceania': 151.2093,
    'All': 2.3522
  }
  return coords[continent] || coords['All']
}

// Use fallback static data
const useFallbackData = (searchTerm, continent, page, limit) => {
  return filterAndPaginateDestinations(fallbackDestinations, searchTerm, continent, page, limit)
}

// Filter and paginate destinations
const filterAndPaginateDestinations = (destinations, searchTerm, continent, page, limit) => {
  let filtered = destinations.filter((dest) => {
    const matchesSearch = searchTerm === '' ||
      dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesContinent = continent === 'All' || dest.continent === continent
    return matchesSearch && matchesContinent
  })

  const total = filtered.length
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedData = filtered.slice(startIndex, endIndex)

  return {
    destinations: paginatedData,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: endIndex < total
  }
}

// City neighborhoods and districts database
const cityNeighborhoods = {
  'Paris': ['Montmartre', 'Le Marais', 'Latin Quarter', 'Saint-Germain', 'Champs-Élysées', 'Louvre District', 'Île de la Cité', 'Bastille', 'Belleville', 'Pigalle'],
  'London': ['Westminster', 'Covent Garden', 'Camden', 'Notting Hill', 'Shoreditch', 'Soho', 'Kensington', 'Chelsea', 'Greenwich', 'Southbank'],
  'Rome': ['Trastevere', 'Vatican City', 'Monti', 'Testaccio', 'Prati', 'Centro Storico', 'Campo de Fiori', 'Colosseum Area', 'Trevi', 'Spanish Steps'],
  'Barcelona': ['Gothic Quarter', 'Eixample', 'Gràcia', 'El Born', 'Barceloneta', 'Sagrada Familia', 'Park Güell', 'Las Ramblas', 'Raval', 'Poble Sec'],
  'Amsterdam': ['Jordaan', 'De Pijp', 'Red Light District', 'Museum Quarter', 'Vondelpark', 'Centrum', 'Amsterdam Noord', 'Oud-West', 'Oost', 'Plantage'],
  'Tokyo': ['Shibuya', 'Shinjuku', 'Harajuku', 'Ginza', 'Roppongi', 'Asakusa', 'Akihabara', 'Ueno', 'Ikebukuro', 'Odaiba'],
  'New York': ['Manhattan', 'Brooklyn', 'Queens', 'The Bronx', 'SoHo', 'Chelsea', 'Upper East Side', 'Williamsburg', 'Greenwich Village', 'Harlem'],
  'Seoul': ['Gangnam', 'Myeongdong', 'Hongdae', 'Itaewon', 'Insadong', 'Dongdaemun', 'Gangbuk', 'Jongno', 'Samcheongdong', 'Bukchon'],
  'Bangkok': ['Sukhumvit', 'Silom', 'Khao San Road', 'Chatuchak', 'Chinatown', 'Siam', 'Thonglor', 'Riverside', 'Pratunam', 'Sathorn'],
  'Singapore': ['Marina Bay', 'Orchard Road', 'Chinatown', 'Little India', 'Sentosa', 'Clarke Quay', 'Bugis', 'Kampong Glam', 'Holland Village', 'Tiong Bahru'],
  'Sydney': ['Circular Quay', 'Darling Harbour', 'Bondi Beach', 'The Rocks', 'Surry Hills', 'Newtown', 'Manly', 'Paddington', 'Kings Cross', 'Barangaroo'],
  'Los Angeles': ['Hollywood', 'Beverly Hills', 'Santa Monica', 'Venice Beach', 'Downtown LA', 'West Hollywood', 'Silver Lake', 'Malibu', 'Pasadena', 'Long Beach'],
  // Indian Cities
  'Bangalore': ['Koramangala', 'Indiranagar', 'Whitefield', 'Jayanagar', 'MG Road', 'Brigade Road', 'Electronic City', 'HSR Layout', 'BTM Layout', 'Malleshwaram'],
  'Mumbai': ['Bandra', 'Colaba', 'Juhu', 'Andheri', 'Powai', 'Worli', 'Lower Parel', 'Dadar', 'Churchgate', 'Marine Lines'],
  'Delhi': ['Connaught Place', 'Hauz Khas', 'Saket', 'Karol Bagh', 'Chandni Chowk', 'Nehru Place', 'Dwarka', 'Rohini', 'Lajpat Nagar', 'Greater Kailash']
}

// Neighborhood descriptions
const neighborhoodTypes = {
  'historic': ['Historic charm with centuries-old architecture', 'Ancient streets and traditional buildings', 'Step back in time in this heritage district'],
  'modern': ['Contemporary urban design and modern amenities', 'Sleek skyscrapers and modern lifestyle', 'Experience the city\'s modern face'],
  'cultural': ['Rich cultural heritage and arts scene', 'Museums, galleries, and cultural centers', 'Immerse in local culture and traditions'],
  'shopping': ['Premier shopping destination with luxury brands', 'Bustling markets and boutique stores', 'Shopping paradise for all tastes'],
  'nightlife': ['Vibrant nightlife and entertainment', 'Trendy bars, clubs, and live music venues', 'Experience the city after dark'],
  'foodie': ['Culinary hotspot with diverse dining options', 'Street food and gourmet restaurants', 'A food lover\'s paradise'],
  'residential': ['Charming residential neighborhood', 'Local life and authentic experiences', 'Discover where locals live and play'],
  'waterfront': ['Scenic waterfront views and activities', 'Marina, beaches, and coastal charm', 'Enjoy stunning water views'],
  'artistic': ['Creative hub with street art and galleries', 'Artists\' quarter with indie shops', 'Bohemian atmosphere and creativity']
}

// Generate expanded static destinations (as alternative to API) - 100,000+ destinations
export const generateExpandedDestinations = () => {
  const expanded = []
  const continents = ['Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania']

  // Additional location type suffixes to create more variations
  const locationSuffixes = [
    'Central', 'North', 'South', 'East', 'West', 'Upper', 'Lower', 'New', 'Old',
    'Greater', 'Little', 'Heights', 'Valley', 'Bay', 'Point', 'Hill', 'Beach'
  ]

  const districtTypes = [
    'District', 'Quarter', 'Ward', 'Zone', 'Area', 'Sector', 'Region', 'Precinct'
  ]

  // Expanded city name bases for generating many cities
  const cityPrefixes = [
    'San', 'Santa', 'Saint', 'Porto', 'New', 'Port', 'Mount', 'Fort', 'Lake', 'River',
    'Bay', 'Cape', 'Glen', 'Vale', 'Spring', 'Meadow', 'Forest', 'Hill', 'Stone', 'Wood'
  ]

  const citySuffixes = [
    'ville', 'ton', 'burg', 'ford', 'field', 'wood', 'port', 'shire', 'dale', 'mont',
    'city', 'town', 'haven', 'bridge', 'land', 'view', 'bay', 'coast', 'side', 'point'
  ]

  const cityMiddleNames = [
    'Green', 'Blue', 'Silver', 'Golden', 'Crystal', 'Pearl', 'Diamond', 'Coral', 'Azure',
    'Royal', 'Imperial', 'Grand', 'Noble', 'Fair', 'Bright', 'Clear', 'High', 'Deep', 'Wide'
  ]

  // Major cities and destinations by continent (core destinations)
  const majorDestinations = {
    'Europe': [
      // France
      'Paris', 'Nice', 'Lyon', 'Bordeaux', 'Marseille', 'Toulouse', 'Strasbourg', 'Cannes', 'Monaco',
      // UK & Ireland
      'London', 'Edinburgh', 'Dublin', 'Manchester', 'Liverpool', 'Glasgow', 'Belfast', 'Oxford', 'Cambridge', 'Bath', 'York',
      // Italy
      'Rome', 'Venice', 'Florence', 'Milan', 'Naples', 'Bologna', 'Verona', 'Turin', 'Pisa', 'Siena', 'Amalfi Coast', 'Cinque Terre',
      // Spain
      'Barcelona', 'Madrid', 'Seville', 'Valencia', 'Granada', 'Bilbao', 'Málaga', 'Palma de Mallorca', 'Ibiza', 'San Sebastian',
      // Portugal
      'Lisbon', 'Porto', 'Faro', 'Sintra', 'Coimbra',
      // Germany
      'Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Dresden', 'Nuremberg', 'Stuttgart', 'Heidelberg',
      // Netherlands & Belgium
      'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Brussels', 'Bruges', 'Antwerp', 'Ghent',
      // Switzerland & Austria
      'Zurich', 'Geneva', 'Bern', 'Lucerne', 'Interlaken', 'Zermatt', 'Vienna', 'Salzburg', 'Innsbruck', 'Hallstatt',
      // Scandinavia
      'Stockholm', 'Copenhagen', 'Oslo', 'Helsinki', 'Reykjavik', 'Bergen', 'Gothenburg', 'Malmö',
      // Eastern Europe
      'Prague', 'Budapest', 'Krakow', 'Warsaw', 'Dubrovnik', 'Split', 'Bucharest', 'Sofia', 'Tallinn', 'Riga', 'Vilnius',
      // Greece
      'Athens', 'Santorini', 'Mykonos', 'Crete', 'Rhodes', 'Corfu', 'Thessaloniki',
      // Other
      'Istanbul', 'Moscow', 'St Petersburg', 'Zurich'
    ],
    'Asia': [
      // India
      'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
      'Jaipur', 'Goa', 'Udaipur', 'Agra', 'Varanasi', 'Rishikesh', 'Amritsar', 'Kochi',
      'Mysore', 'Jodhpur', 'Lucknow', 'Chandigarh', 'Shimla', 'Manali', 'Darjeeling', 'Srinagar',
      'Coimbatore', 'Madurai', 'Thiruvananthapuram', 'Vijayawada', 'Visakhapatnam', 'Bhopal',
      'Indore', 'Nagpur', 'Jaisalmer', 'Pushkar', 'Ranthambore', 'Khajuraho', 'Hampi', 'Pondicherry',
      // Japan
      'Tokyo', 'Kyoto', 'Osaka', 'Hiroshima', 'Nara', 'Yokohama', 'Sapporo', 'Fukuoka', 'Nikko', 'Hakone',
      // South Korea
      'Seoul', 'Busan', 'Jeju Island', 'Incheon', 'Daegu', 'Gyeongju',
      // Southeast Asia
      'Bangkok', 'Singapore', 'Bali', 'Phuket', 'Chiang Mai', 'Krabi', 'Koh Samui', 'Pattaya',
      'Hanoi', 'Ho Chi Minh', 'Hoi An', 'Da Nang', 'Nha Trang', 'Sapa', 'Ha Long Bay',
      'Kuala Lumpur', 'Penang', 'Langkawi', 'Manila', 'Boracay', 'Palawan', 'Jakarta', 'Yogyakarta',
      'Siem Reap', 'Phnom Penh', 'Yangon', 'Bagan', 'Luang Prabang', 'Vientiane',
      // China
      'Hong Kong', 'Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Xi\'an', 'Guilin', 'Hangzhou', 'Macau',
      // Middle East
      'Dubai', 'Abu Dhabi', 'Doha', 'Muscat', 'Tel Aviv', 'Jerusalem', 'Petra', 'Amman',
      // Other
      'Taipei', 'Kathmandu', 'Colombo', 'Maldives'
    ],
    'North America': [
      // USA - Major Cities
      'New York', 'Los Angeles', 'San Francisco', 'Las Vegas', 'Miami', 'Chicago',
      'Seattle', 'Boston', 'Washington DC', 'New Orleans', 'Austin', 'Portland',
      'San Diego', 'Denver', 'Nashville', 'Philadelphia', 'Phoenix', 'Dallas',
      'Houston', 'Atlanta', 'Minneapolis', 'Detroit', 'Baltimore', 'Charleston',
      'Savannah', 'Orlando', 'Tampa', 'Honolulu', 'Anchorage', 'San Antonio',
      'Fort Lauderdale', 'Key West', 'Santa Fe', 'Aspen', 'Park City', 'Napa Valley',
      'Memphis', 'Kansas City', 'St. Louis', 'Cleveland', 'Pittsburgh', 'Cincinnati',
      'Milwaukee', 'Indianapolis', 'Columbus', 'Charlotte', 'Raleigh', 'Richmond',
      'Buffalo', 'Providence', 'Hartford', 'Burlington', 'Portland Maine', 'Asheville',
      // USA - National Parks & Destinations
      'Grand Canyon', 'Yellowstone', 'Yosemite', 'Zion', 'Glacier National Park', 'Maui',
      // Canada
      'Vancouver', 'Toronto', 'Montreal', 'Quebec City', 'Calgary', 'Ottawa', 'Whistler', 'Banff',
      'Victoria', 'Halifax', 'Edmonton', 'Niagara Falls',
      // Mexico
      'Mexico City', 'Cancun', 'Playa del Carmen', 'Guadalajara', 'Oaxaca', 'San Miguel de Allende',
      'Tulum', 'Puerto Vallarta', 'Cabo San Lucas', 'Monterrey', 'Guanajuato', 'Merida'
    ],
    'South America': [
      'Buenos Aires', 'Rio de Janeiro', 'Lima', 'Santiago', 'Bogotá', 'Medellín',
      'Cusco', 'Quito', 'Cartagena', 'Montevideo', 'La Paz', 'São Paulo',
      'Brasília', 'Salvador', 'Florianópolis', 'Iguazu Falls', 'Patagonia', 'Mendoza',
      'Córdoba', 'Bariloche', 'Valparaíso', 'Arequipa', 'Machu Picchu', 'Galápagos Islands',
      'Amazon Rainforest', 'Manaus', 'Recife', 'Fortaleza', 'Belém', 'Maceió'
    ],
    'Africa': [
      'Cape Town', 'Marrakech', 'Cairo', 'Nairobi', 'Johannesburg', 'Zanzibar',
      'Serengeti', 'Victoria Falls', 'Casablanca', 'Tunis', 'Addis Ababa', 'Accra',
      'Durban', 'Pretoria', 'Kruger National Park', 'Masai Mara', 'Sahara Desert', 'Fez',
      'Tangier', 'Essaouira', 'Luxor', 'Aswan', 'Alexandria', 'Giza',
      'Dakar', 'Lagos', 'Kigali', 'Dar es Salaam', 'Stone Town', 'Mombasa'
    ],
    'Oceania': [
      // Australia - Major Cities
      'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Cairns',
      'Canberra', 'Hobart', 'Darwin', 'Newcastle', 'Wollongong', 'Geelong', 'Townsville',
      'Sunshine Coast', 'Byron Bay', 'Alice Springs', 'Broome', 'Margaret River',
      // Australia - Destinations
      'Great Barrier Reef', 'Uluru', 'Whitsundays', 'Blue Mountains', 'Tasmania',
      // New Zealand
      'Auckland', 'Wellington', 'Christchurch', 'Queenstown', 'Rotorua', 'Taupo',
      'Nelson', 'Dunedin', 'Hamilton', 'Palmerston North', 'Milford Sound', 'Mount Cook',
      // Pacific Islands
      'Fiji', 'Suva', 'Nadi', 'Port Vila', 'Noumea', 'Papeete', 'Bora Bora'
    ]
  }

  // Generate additional synthetic cities to reach 100,000+ destinations
  const generateSyntheticCities = (continent, count) => {
    const syntheticCities = []
    for (let i = 0; i < count; i++) {
      const prefix = cityPrefixes[Math.floor(Math.random() * cityPrefixes.length)]
      const middle = cityMiddleNames[Math.floor(Math.random() * cityMiddleNames.length)]
      const suffix = citySuffixes[Math.floor(Math.random() * citySuffixes.length)]

      // Create varied city names
      let cityName
      if (Math.random() > 0.7) {
        cityName = `${prefix} ${middle}`
      } else if (Math.random() > 0.5) {
        cityName = `${middle}${suffix}`
      } else {
        cityName = `${prefix}${suffix}`
      }

      syntheticCities.push(cityName)
    }
    return syntheticCities
  }

  let id = 1000

  continents.forEach(continent => {
    // Combine real cities with synthetic ones (targeting ~1,634 cities per continent for 500,000 total destinations)
    const realCities = majorDestinations[continent]
    const syntheticCities = generateSyntheticCities(continent, 1586)
    const allCities = [...realCities, ...syntheticCities]

    allCities.forEach((city) => {
      const avgCost = getAverageCostForCity(city)

      // Add main city destination
      expanded.push({
        id: id++,
        name: city,
        country: getCountryForCity(city, continent),
        continent,
        rating: (4.3 + Math.random() * 0.7).toFixed(1),
        reviews: Math.floor(Math.random() * 50000) + 5000,
        averageCost: avgCost,
        currency: getCurrencyForCity(city, continent),
        image: getCityImage(city),
        description: getCityDescription(city),
        coordinates: getCityCoordinates(city),
        topAttractions: generateCityAttractions(city),
        popularHotels: generateCityHotels(city, avgCost),
        bestTimeToVisit: getBestTimeToVisit(continent),
        languages: getLanguagesForCity(city),
        weatherInfo: getWeatherInfo(continent),
        visaRequired: getVisaRequirement(city),
        popularActivities: getCityActivities(city),
        type: 'city'
      })

      // Add 30 neighborhood variations per city
      const neighborhoods = cityNeighborhoods[city] || generateGenericNeighborhoods(city)
      const typesArray = Object.keys(neighborhoodTypes)

      // Expand neighborhoods to 30 per city
      for (let i = 0; i < 30; i++) {
        const neighborhood = neighborhoods[i % neighborhoods.length]
        const suffix = locationSuffixes[i % locationSuffixes.length]
        const neighborhoodName = i < neighborhoods.length ? neighborhood : `${neighborhood} ${suffix}`

        const typeKey = typesArray[i % typesArray.length]
        const descriptions = neighborhoodTypes[typeKey]
        const descriptionText = descriptions[Math.floor(Math.random() * descriptions.length)]

        expanded.push({
          id: id++,
          name: neighborhoodName,
          parentCity: city,
          country: getCountryForCity(city, continent),
          continent,
          rating: (3.8 + Math.random() * 1.2).toFixed(1),
          reviews: Math.floor(Math.random() * 15000) + 500,
          averageCost: avgCost + Math.floor(Math.random() * 40) - 20,
          currency: getCurrencyForCity(city, continent),
          image: getNeighborhoodImage(city, typeKey),
          description: `${neighborhoodName} is a charming ${typeKey} district in ${city}. ${descriptionText}. Perfect for travelers seeking authentic local experiences and unique attractions.`,
          coordinates: getCityCoordinates(city),
          topAttractions: generateNeighborhoodAttractions(neighborhoodName, city),
          bestTimeToVisit: getBestTimeToVisit(continent),
          languages: getLanguagesForCity(city),
          weatherInfo: getWeatherInfo(continent),
          visaRequired: getVisaRequirement(city),
          popularActivities: getNeighborhoodActivities(typeKey),
          type: 'neighborhood',
          neighborhoodType: typeKey
        })
      }

      // Add 20 district/zone variations per city
      for (let i = 0; i < 20; i++) {
        const districtType = districtTypes[i % districtTypes.length]
        const locationSuffix = locationSuffixes[i % locationSuffixes.length]
        const districtName = `${locationSuffix} ${districtType}`

        const typeKey = typesArray[i % typesArray.length]
        const descriptions = neighborhoodTypes[typeKey]
        const descriptionText = descriptions[Math.floor(Math.random() * descriptions.length)]

        expanded.push({
          id: id++,
          name: `${city} ${districtName}`,
          parentCity: city,
          country: getCountryForCity(city, continent),
          continent,
          rating: (3.7 + Math.random() * 1.3).toFixed(1),
          reviews: Math.floor(Math.random() * 10000) + 300,
          averageCost: avgCost + Math.floor(Math.random() * 50) - 25,
          currency: getCurrencyForCity(city, continent),
          image: getDistrictImage(city, typeKey),
          description: `${city} ${districtName} is an emerging ${typeKey} area. ${descriptionText}. Discover this exciting part of the city with local charm and character.`,
          coordinates: getCityCoordinates(city),
          topAttractions: generateNeighborhoodAttractions(districtName, city),
          bestTimeToVisit: getBestTimeToVisit(continent),
          languages: getLanguagesForCity(city),
          weatherInfo: getWeatherInfo(continent),
          visaRequired: getVisaRequirement(city),
          popularActivities: getNeighborhoodActivities(typeKey),
          type: 'district',
          neighborhoodType: typeKey
        })
      }
    })
  })

  console.log(`Generated ${expanded.length} destinations`)
  return expanded
}

// Helper: Generate generic neighborhoods for cities not in database
const generateGenericNeighborhoods = (city) => {
  return [
    `${city} Downtown`,
    `${city} Historic Quarter`,
    `${city} Waterfront`,
    `${city} Cultural District`,
    `${city} Shopping Area`,
    `${city} Old Town`,
    `${city} Marina`,
    `${city} Arts Quarter`,
    `${city} Market District`,
    `${city} Entertainment Zone`
  ]
}

// Helper: Generate popular hotels for a city
const generateCityHotels = (city, avgCost) => {
  const hotelTypes = ['Luxury', 'Business', 'Boutique', 'Budget', 'Resort']
  const hotelChains = {
    'Luxury': ['Ritz-Carlton', 'Four Seasons', 'Mandarin Oriental', 'St. Regis', 'Peninsula'],
    'Business': ['Marriott', 'Hilton', 'Hyatt', 'InterContinental', 'Sheraton'],
    'Boutique': ['Kimpton', 'Ace Hotel', 'Citizen M', 'Moxy', 'W Hotel'],
    'Budget': ['Holiday Inn', 'Best Western', 'Ibis', 'Hampton Inn', 'Comfort Inn'],
    'Resort': ['Grand Resort', 'Beach Resort', 'Spa Resort', 'Mountain Lodge', 'Island Resort']
  }

  const hotels = []
  const baseCost = avgCost * 0.8 // Hotel cost relative to daily avg

  hotelTypes.forEach((type, idx) => {
    const chains = hotelChains[type]
    const chain = chains[Math.floor(Math.random() * chains.length)]

    let priceMultiplier
    switch(type) {
      case 'Luxury': priceMultiplier = 3; break
      case 'Business': priceMultiplier = 1.8; break
      case 'Boutique': priceMultiplier = 1.5; break
      case 'Budget': priceMultiplier = 0.6; break
      case 'Resort': priceMultiplier = 2.5; break
      default: priceMultiplier = 1
    }

    hotels.push({
      name: `${chain} ${city}`,
      type,
      rating: (4.0 + Math.random() * 1.0).toFixed(1),
      reviews: Math.floor(Math.random() * 5000) + 500,
      pricePerNight: Math.round(baseCost * priceMultiplier),
      amenities: getHotelAmenities(type),
      distance: (Math.random() * 5).toFixed(1), // km from city center
      image: getHotelImage(type)
    })
  })

  return hotels
}

// Helper: Get hotel amenities based on type
const getHotelAmenities = (type) => {
  const amenityMap = {
    'Luxury': ['Spa', 'Fine Dining', 'Concierge', 'Pool', 'Gym', 'Valet Parking'],
    'Business': ['Business Center', 'Meeting Rooms', 'WiFi', 'Gym', 'Restaurant'],
    'Boutique': ['Rooftop Bar', 'Art Gallery', 'Café', 'WiFi', 'Stylish Rooms'],
    'Budget': ['WiFi', 'Breakfast', 'Parking', 'Clean Rooms', '24hr Reception'],
    'Resort': ['Beach Access', 'Pool', 'Spa', 'Activities', 'All-Inclusive', 'Kids Club']
  }
  return amenityMap[type] || ['WiFi', 'Reception', 'Clean Rooms']
}

// Helper: Generate city attractions
const generateCityAttractions = (city) => {
  const attractions = {
    // India
    'Mumbai': ['Gateway of India', 'Marine Drive', 'Taj Mahal Palace Hotel', 'Elephanta Caves', 'Chhatrapati Shivaji Terminus', 'Bandra-Worli Sea Link'],
    'Delhi': ['India Gate', 'Red Fort', 'Qutub Minar', 'Lotus Temple', 'Humayun\'s Tomb', 'Akshardham Temple'],
    'Bangalore': ['Lalbagh Botanical Garden', 'Bangalore Palace', 'Cubbon Park', 'Vidhana Soudha', 'ISKCON Temple', 'Tipu Sultan\'s Palace'],
    'Jaipur': ['Amber Fort', 'City Palace', 'Hawa Mahal', 'Jantar Mantar', 'Nahargarh Fort', 'Jal Mahal'],
    'Agra': ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh', 'Itmad-ud-Daulah', 'Akbar\'s Tomb'],
    'Varanasi': ['Ganges River', 'Kashi Vishwanath Temple', 'Dashashwamedh Ghat', 'Sarnath', 'Assi Ghat', 'Ramnagar Fort'],
    'Goa': ['Baga Beach', 'Basilica of Bom Jesus', 'Fort Aguada', 'Dudhsagar Falls', 'Anjuna Market', 'Calangute Beach'],
    // USA
    'New York': ['Statue of Liberty', 'Central Park', 'Times Square', 'Empire State Building', 'Brooklyn Bridge', '9/11 Memorial'],
    'Los Angeles': ['Hollywood Sign', 'Santa Monica Pier', 'Griffith Observatory', 'Venice Beach', 'Getty Center', 'Universal Studios'],
    'San Francisco': ['Golden Gate Bridge', 'Alcatraz Island', 'Fisherman\'s Wharf', 'Cable Cars', 'Chinatown', 'Lombard Street'],
    'Las Vegas': ['The Strip', 'Bellagio Fountains', 'Fremont Street', 'High Roller', 'Red Rock Canyon', 'Hoover Dam'],
    'Miami': ['South Beach', 'Art Deco District', 'Vizcaya Museum', 'Little Havana', 'Wynwood Walls', 'Everglades National Park'],
    'Chicago': ['Willis Tower', 'Navy Pier', 'Millennium Park', 'Cloud Gate', 'Art Institute of Chicago', 'Magnificent Mile'],
    // Australia
    'Sydney': ['Sydney Opera House', 'Harbour Bridge', 'Bondi Beach', 'The Rocks', 'Taronga Zoo', 'Royal Botanic Gardens'],
    'Melbourne': ['Federation Square', 'Royal Botanic Gardens Melbourne', 'Great Ocean Road', 'St Kilda Beach', 'Queen Victoria Market', 'Eureka Tower'],
    'Brisbane': ['South Bank Parklands', 'Story Bridge', 'Lone Pine Koala Sanctuary', 'City Botanic Gardens', 'Mount Coot-tha', 'Roma Street Parkland'],
    'Perth': ['Kings Park', 'Cottesloe Beach', 'Rottnest Island', 'Swan River', 'Perth Mint', 'Fremantle'],
    // Europe
    'Paris': ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Arc de Triomphe', 'Sacré-Cœur', 'Champs-Élysées'],
    'London': ['Big Ben', 'Tower of London', 'British Museum', 'London Eye', 'Buckingham Palace', 'Tower Bridge'],
    'Rome': ['Colosseum', 'Vatican Museums', 'Trevi Fountain', 'Pantheon', 'Roman Forum', 'Spanish Steps'],
    'Barcelona': ['Sagrada Familia', 'Park Güell', 'La Rambla', 'Casa Batlló', 'Gothic Quarter', 'Camp Nou'],
    'Amsterdam': ['Anne Frank House', 'Van Gogh Museum', 'Canal Ring', 'Rijksmuseum', 'Jordaan', 'Vondelpark'],
    'Berlin': ['Brandenburg Gate', 'Berlin Wall', 'Reichstag', 'Museum Island', 'Checkpoint Charlie', 'TV Tower'],
    'Prague': ['Charles Bridge', 'Prague Castle', 'Old Town Square', 'Astronomical Clock', 'St. Vitus Cathedral', 'Wenceslas Square'],
    'Vienna': ['Schönbrunn Palace', 'St. Stephen\'s Cathedral', 'Hofburg Palace', 'Belvedere Palace', 'Vienna State Opera', 'Prater'],
    // Asia
    'Tokyo': ['Tokyo Tower', 'Senso-ji Temple', 'Meiji Shrine', 'Shibuya Crossing', 'Tokyo Skytree', 'Imperial Palace'],
    'Bangkok': ['Grand Palace', 'Wat Arun', 'Wat Pho', 'Chatuchak Market', 'Khao San Road', 'Jim Thompson House'],
    'Singapore': ['Marina Bay Sands', 'Gardens by the Bay', 'Sentosa Island', 'Universal Studios Singapore', 'Singapore Chinatown', 'Little India'],
    'Dubai': ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Dubai Marina', 'Gold Souk', 'Desert Safari'],
    'Hong Kong': ['Victoria Peak', 'Star Ferry', 'Temple Street Market', 'Tian Tan Buddha', 'Victoria Harbour', 'Lan Kwai Fong']
  }
  return attractions[city] || [`${city} Central Plaza`, `${city} Museum`, `${city} Cathedral`, `${city} Park`, `${city} Market`, `${city} Tower`]
}

// Helper: Generate neighborhood attractions
const generateNeighborhoodAttractions = (neighborhood, city) => {
  return [
    `${neighborhood} Main Street`,
    `${neighborhood} Market`,
    `${neighborhood} Park`,
    `${neighborhood} Cultural Center`,
    `Local Restaurants in ${neighborhood}`,
    `${neighborhood} Shopping District`
  ]
}

// Helper: Get city-specific activities
const getCityActivities = (city) => {
  const activities = ['Sightseeing', 'Culture', 'Food', 'Museums', 'Shopping', 'Nightlife']
  return activities.slice(0, 4)
}

// Helper: Get neighborhood activities based on type
const getNeighborhoodActivities = (type) => {
  const activityMap = {
    'historic': ['Culture', 'Sightseeing', 'Museums'],
    'modern': ['Shopping', 'Nightlife', 'Food'],
    'cultural': ['Culture', 'Museums', 'Sightseeing'],
    'shopping': ['Shopping', 'Food', 'Nightlife'],
    'nightlife': ['Nightlife', 'Food', 'Sightseeing'],
    'foodie': ['Food', 'Culture', 'Shopping'],
    'residential': ['Food', 'Shopping', 'Culture'],
    'waterfront': ['Nature', 'Beach', 'Sightseeing'],
    'artistic': ['Culture', 'Shopping', 'Museums']
  }
  return activityMap[type] || ['Sightseeing', 'Food', 'Shopping']
}

// Helper: Get average cost for major cities
const getAverageCostForCity = (city) => {
  const costs = {
    // India - Generally affordable
    'Mumbai': 60, 'Delhi': 55, 'Bangalore': 50, 'Hyderabad': 45, 'Chennai': 45,
    'Kolkata': 40, 'Pune': 50, 'Ahmedabad': 45, 'Jaipur': 50, 'Goa': 70,
    'Udaipur': 60, 'Agra': 40, 'Varanasi': 35, 'Rishikesh': 40, 'Amritsar': 35,
    'Kochi': 55, 'Mysore': 45, 'Jodhpur': 45,
    // USA - Premium pricing
    'New York': 220, 'Los Angeles': 200, 'San Francisco': 210, 'Las Vegas': 150,
    'Miami': 180, 'Chicago': 170, 'Seattle': 180, 'Boston': 190, 'Washington DC': 180,
    'New Orleans': 150, 'Austin': 140, 'Portland': 150, 'San Diego': 170,
    'Denver': 150, 'Nashville': 140, 'Orlando': 160, 'Honolulu': 220,
    // Australia - High pricing
    'Sydney': 180, 'Melbourne': 170, 'Brisbane': 150, 'Perth': 160,
    'Adelaide': 140, 'Gold Coast': 150, 'Cairns': 140, 'Hobart': 130,
    // Europe - Varied pricing
    'Paris': 180, 'London': 200, 'Rome': 140, 'Barcelona': 130, 'Amsterdam': 150,
    'Vienna': 130, 'Prague': 90, 'Berlin': 120, 'Venice': 160, 'Florence': 140,
    'Milan': 150, 'Madrid': 120, 'Lisbon': 100, 'Athens': 90, 'Dublin': 160,
    'Edinburgh': 140, 'Budapest': 80, 'Zurich': 220, 'Stockholm': 170,
    'Copenhagen': 180, 'Oslo': 190, 'Reykjavik': 200,
    // Japan
    'Tokyo': 150, 'Kyoto': 130, 'Osaka': 120,
    // Southeast Asia
    'Bangkok': 50, 'Singapore': 160, 'Bali': 60, 'Phuket': 70,
    // China
    'Hong Kong': 140, 'Shanghai': 100, 'Beijing': 90,
    // Middle East
    'Dubai': 170, 'Abu Dhabi': 160,
    // Canada
    'Vancouver': 160, 'Toronto': 150, 'Montreal': 130,
    // Mexico
    'Mexico City': 70, 'Cancun': 120, 'Tulum': 110
  }
  return costs[city] || Math.floor(Math.random() * 150) + 80
}

// Helper: Get currency for specific cities
const getCurrencyForCity = (city, continent) => {
  const currencies = {
    // India
    'Mumbai': 'INR', 'Delhi': 'INR', 'Bangalore': 'INR', 'Hyderabad': 'INR', 'Chennai': 'INR',
    'Kolkata': 'INR', 'Pune': 'INR', 'Ahmedabad': 'INR', 'Jaipur': 'INR', 'Goa': 'INR',
    'Udaipur': 'INR', 'Agra': 'INR', 'Varanasi': 'INR', 'Rishikesh': 'INR', 'Amritsar': 'INR',
    'Kochi': 'INR', 'Mysore': 'INR', 'Jodhpur': 'INR',
    // USA
    'New York': 'USD', 'Los Angeles': 'USD', 'San Francisco': 'USD', 'Las Vegas': 'USD',
    'Miami': 'USD', 'Chicago': 'USD', 'Seattle': 'USD', 'Boston': 'USD',
    // Australia
    'Sydney': 'AUD', 'Melbourne': 'AUD', 'Brisbane': 'AUD', 'Perth': 'AUD',
    'Adelaide': 'AUD', 'Gold Coast': 'AUD', 'Cairns': 'AUD',
    // Europe
    'Paris': 'EUR', 'London': 'GBP', 'Tokyo': 'JPY', 'Singapore': 'SGD',
    'Dubai': 'AED', 'Bangkok': 'THB', 'Hong Kong': 'HKD', 'Seoul': 'KRW',
    'Zurich': 'CHF', 'Geneva': 'CHF', 'Oslo': 'NOK', 'Stockholm': 'SEK', 'Copenhagen': 'DKK',
    'Budapest': 'HUF', 'Prague': 'CZK', 'Warsaw': 'PLN'
  }
  return currencies[city] || getCurrencyForContinent(continent)
}

// Helper: Get languages for cities
const getLanguagesForCity = (city) => {
  const languages = {
    // India
    'Mumbai': ['Hindi', 'Marathi', 'English'], 'Delhi': ['Hindi', 'English'], 'Bangalore': ['Kannada', 'English', 'Hindi'],
    'Hyderabad': ['Telugu', 'Hindi', 'English'], 'Chennai': ['Tamil', 'English'], 'Kolkata': ['Bengali', 'Hindi', 'English'],
    'Pune': ['Marathi', 'Hindi', 'English'], 'Ahmedabad': ['Gujarati', 'Hindi', 'English'],
    'Jaipur': ['Hindi', 'English'], 'Goa': ['Konkani', 'Marathi', 'English'],
    // USA
    'New York': ['English', 'Spanish'], 'Los Angeles': ['English', 'Spanish'], 'Miami': ['English', 'Spanish'],
    // Australia
    'Sydney': ['English'], 'Melbourne': ['English'], 'Brisbane': ['English'],
    // Europe
    'Paris': ['French', 'English'], 'London': ['English'], 'Tokyo': ['Japanese', 'English'],
    'Barcelona': ['Spanish', 'Catalan', 'English'], 'Amsterdam': ['Dutch', 'English'],
    'Dubai': ['Arabic', 'English'], 'Singapore': ['English', 'Chinese', 'Malay'],
    'Rome': ['Italian', 'English'], 'Berlin': ['German', 'English'], 'Madrid': ['Spanish', 'English']
  }
  return languages[city] || ['English']
}

// Helper: Get visa requirements
const getVisaRequirement = (city) => {
  return Math.random() > 0.6
}

// Helper: Get weather information
const getWeatherInfo = (continent) => {
  const weather = {
    'Europe': 'Mild summers, cool winters',
    'Asia': 'Tropical to temperate depending on region',
    'North America': 'Four distinct seasons',
    'South America': 'Varied from tropical to temperate',
    'Africa': 'Generally warm to hot year-round',
    'Oceania': 'Mild to warm, varies by region'
  }
  return weather[continent] || 'Pleasant weather year-round'
}

// Helper: Get city-specific descriptions
const getCityDescription = (city) => {
  const descriptions = {
    // India
    'Bangalore': 'Bangalore, the Silicon Valley of India, is a vibrant cosmopolitan city known for its pleasant climate, lush gardens, and thriving tech industry. Explore historic palaces, beautiful parks like Lalbagh and Cubbon Park, and experience the perfect blend of traditional Indian culture with modern innovation.',
    'Mumbai': 'Mumbai, the City of Dreams, is India\'s financial capital and entertainment hub. From the iconic Gateway of India to the bustling Marine Drive, this vibrant metropolis offers a unique blend of colonial architecture, Bollywood glamour, and coastal beauty.',
    'Delhi': 'Delhi, India\'s historic capital, seamlessly blends ancient heritage with modern sophistication. Discover magnificent Mughal monuments like the Red Fort and Qutub Minar, explore vibrant markets, and experience the rich cultural tapestry of this dynamic city.',
    'Jaipur': 'Jaipur, the Pink City, is a majestic destination featuring stunning palaces, magnificent forts, and vibrant bazaars. The city\'s rose-colored buildings, including the iconic Hawa Mahal and Amber Fort, showcase Rajasthan\'s royal heritage.',
    'Agra': 'Agra is home to the Taj Mahal, one of the Seven Wonders of the World. This historic city on the banks of the Yamuna River showcases exceptional Mughal architecture and timeless romance.',
    // USA
    'New York': 'New York City, the city that never sleeps, is a global hub of culture, finance, and entertainment. From iconic landmarks like the Statue of Liberty to world-class museums, Broadway shows, and diverse neighborhoods, NYC offers endless excitement.',
    'Los Angeles': 'Los Angeles, the Entertainment Capital of the World, combines glamorous Hollywood, beautiful beaches, and perfect weather. Experience celebrity culture, stunning coastlines, and the vibrant energy of Southern California.',
    'San Francisco': 'San Francisco charms visitors with its iconic Golden Gate Bridge, historic cable cars, and hilly streets. This cultural hub offers stunning bay views, world-class cuisine, and a unique blend of Victorian architecture and tech innovation.',
    // Australia
    'Sydney': 'Sydney captivates with its stunning harbor, iconic Opera House, and beautiful beaches. This vibrant cosmopolitan city combines natural beauty with urban sophistication, offering world-class dining, culture, and outdoor adventures.',
    'Melbourne': 'Melbourne is Australia\'s cultural capital, renowned for its coffee culture, street art, and sporting events. Explore hidden laneways, diverse neighborhoods, and experience the city\'s thriving arts and food scenes.',
    // Europe
    'Paris': 'Paris, the City of Light, enchants visitors with iconic landmarks like the Eiffel Tower and Louvre, world-class cuisine, and romantic ambiance. Experience art, culture, and elegance in this timeless European capital.',
    'London': 'London seamlessly blends royal heritage with modern innovation. From historic palaces and the Tower of London to vibrant markets and West End shows, Britain\'s capital offers endless cultural treasures.',
    'Rome': 'Rome, the Eternal City, is an open-air museum showcasing ancient wonders like the Colosseum and Roman Forum. Experience over 2,000 years of history, world-class art, and authentic Italian cuisine.',
    'Barcelona': 'Barcelona dazzles with Gaudí\'s architectural masterpieces, Mediterranean beaches, and Catalan culture. From the Sagrada Familia to Las Ramblas, this vibrant city offers art, architecture, and seaside charm.'
  }
  return descriptions[city] || `${city} is a world-renowned destination offering an incredible blend of culture, history, and modern attractions. From iconic landmarks to hidden gems, this vibrant city has something for every traveler.`
}

// Helper: Get city coordinates (approximate)
const getCityCoordinates = (city) => {
  const coords = {
    'Paris': { lat: 48.8566, lng: 2.3522 },
    'London': { lat: 51.5074, lng: -0.1278 },
    'Tokyo': { lat: 35.6762, lng: 139.6503 },
    'New York': { lat: 40.7128, lng: -74.0060 },
    'Singapore': { lat: 1.3521, lng: 103.8198 },
    'Sydney': { lat: -33.8688, lng: 151.2093 }
  }
  return coords[city] || { lat: 0, lng: 0 }
}

// Helper functions
const getCountryForCity = (city, continent) => {
  const cityToCountry = {
    // India
    'Mumbai': 'India', 'Delhi': 'India', 'Bangalore': 'India', 'Hyderabad': 'India', 'Chennai': 'India',
    'Kolkata': 'India', 'Pune': 'India', 'Ahmedabad': 'India', 'Jaipur': 'India', 'Goa': 'India',
    'Udaipur': 'India', 'Agra': 'India', 'Varanasi': 'India', 'Rishikesh': 'India', 'Amritsar': 'India',
    'Kochi': 'India', 'Mysore': 'India', 'Jodhpur': 'India', 'Lucknow': 'India', 'Chandigarh': 'India',
    'Shimla': 'India', 'Manali': 'India', 'Darjeeling': 'India', 'Srinagar': 'India', 'Coimbatore': 'India',
    'Madurai': 'India', 'Thiruvananthapuram': 'India', 'Vijayawada': 'India', 'Visakhapatnam': 'India',
    'Bhopal': 'India', 'Indore': 'India', 'Nagpur': 'India', 'Jaisalmer': 'India', 'Pushkar': 'India',
    'Ranthambore': 'India', 'Khajuraho': 'India', 'Hampi': 'India', 'Pondicherry': 'India',
    // USA
    'New York': 'USA', 'Los Angeles': 'USA', 'San Francisco': 'USA', 'Las Vegas': 'USA', 'Miami': 'USA',
    'Chicago': 'USA', 'Seattle': 'USA', 'Boston': 'USA', 'Washington DC': 'USA', 'New Orleans': 'USA',
    'Austin': 'USA', 'Portland': 'USA', 'San Diego': 'USA', 'Denver': 'USA', 'Nashville': 'USA',
    'Philadelphia': 'USA', 'Phoenix': 'USA', 'Dallas': 'USA', 'Houston': 'USA', 'Atlanta': 'USA',
    'Minneapolis': 'USA', 'Detroit': 'USA', 'Baltimore': 'USA', 'Charleston': 'USA', 'Savannah': 'USA',
    'Orlando': 'USA', 'Tampa': 'USA', 'Honolulu': 'USA', 'Anchorage': 'USA', 'San Antonio': 'USA',
    'Fort Lauderdale': 'USA', 'Key West': 'USA', 'Santa Fe': 'USA', 'Aspen': 'USA', 'Park City': 'USA',
    'Napa Valley': 'USA', 'Memphis': 'USA', 'Kansas City': 'USA', 'St. Louis': 'USA', 'Cleveland': 'USA',
    'Pittsburgh': 'USA', 'Cincinnati': 'USA', 'Milwaukee': 'USA', 'Indianapolis': 'USA', 'Columbus': 'USA',
    'Charlotte': 'USA', 'Raleigh': 'USA', 'Richmond': 'USA', 'Buffalo': 'USA', 'Providence': 'USA',
    'Hartford': 'USA', 'Burlington': 'USA', 'Portland Maine': 'USA', 'Asheville': 'USA',
    'Grand Canyon': 'USA', 'Yellowstone': 'USA', 'Yosemite': 'USA', 'Zion': 'USA',
    'Glacier National Park': 'USA', 'Maui': 'USA',
    // Australia
    'Sydney': 'Australia', 'Melbourne': 'Australia', 'Brisbane': 'Australia', 'Perth': 'Australia',
    'Adelaide': 'Australia', 'Gold Coast': 'Australia', 'Cairns': 'Australia', 'Canberra': 'Australia',
    'Hobart': 'Australia', 'Darwin': 'Australia', 'Newcastle': 'Australia', 'Wollongong': 'Australia',
    'Geelong': 'Australia', 'Townsville': 'Australia', 'Sunshine Coast': 'Australia', 'Byron Bay': 'Australia',
    'Alice Springs': 'Australia', 'Broome': 'Australia', 'Margaret River': 'Australia',
    'Great Barrier Reef': 'Australia', 'Uluru': 'Australia', 'Whitsundays': 'Australia',
    'Blue Mountains': 'Australia', 'Tasmania': 'Australia',
    // Europe - France
    'Paris': 'France', 'Nice': 'France', 'Lyon': 'France', 'Bordeaux': 'France', 'Marseille': 'France',
    'Toulouse': 'France', 'Strasbourg': 'France', 'Cannes': 'France', 'Monaco': 'Monaco',
    // Europe - UK & Ireland
    'London': 'United Kingdom', 'Edinburgh': 'United Kingdom', 'Manchester': 'United Kingdom',
    'Liverpool': 'United Kingdom', 'Glasgow': 'United Kingdom', 'Belfast': 'United Kingdom',
    'Oxford': 'United Kingdom', 'Cambridge': 'United Kingdom', 'Bath': 'United Kingdom', 'York': 'United Kingdom',
    'Dublin': 'Ireland',
    // Europe - Italy
    'Rome': 'Italy', 'Venice': 'Italy', 'Florence': 'Italy', 'Milan': 'Italy', 'Naples': 'Italy',
    'Bologna': 'Italy', 'Verona': 'Italy', 'Turin': 'Italy', 'Pisa': 'Italy', 'Siena': 'Italy',
    'Amalfi Coast': 'Italy', 'Cinque Terre': 'Italy',
    // Europe - Spain
    'Barcelona': 'Spain', 'Madrid': 'Spain', 'Seville': 'Spain', 'Valencia': 'Spain', 'Granada': 'Spain',
    'Bilbao': 'Spain', 'Málaga': 'Spain', 'Palma de Mallorca': 'Spain', 'Ibiza': 'Spain', 'San Sebastian': 'Spain',
    // Europe - Portugal
    'Lisbon': 'Portugal', 'Porto': 'Portugal', 'Faro': 'Portugal', 'Sintra': 'Portugal', 'Coimbra': 'Portugal',
    // Europe - Germany
    'Berlin': 'Germany', 'Munich': 'Germany', 'Hamburg': 'Germany', 'Frankfurt': 'Germany', 'Cologne': 'Germany',
    'Dresden': 'Germany', 'Nuremberg': 'Germany', 'Stuttgart': 'Germany', 'Heidelberg': 'Germany',
    // Europe - Netherlands & Belgium
    'Amsterdam': 'Netherlands', 'Rotterdam': 'Netherlands', 'The Hague': 'Netherlands', 'Utrecht': 'Netherlands',
    'Brussels': 'Belgium', 'Bruges': 'Belgium', 'Antwerp': 'Belgium', 'Ghent': 'Belgium',
    // Europe - Switzerland & Austria
    'Zurich': 'Switzerland', 'Geneva': 'Switzerland', 'Bern': 'Switzerland', 'Lucerne': 'Switzerland',
    'Interlaken': 'Switzerland', 'Zermatt': 'Switzerland',
    'Vienna': 'Austria', 'Salzburg': 'Austria', 'Innsbruck': 'Austria', 'Hallstatt': 'Austria',
    // Europe - Scandinavia
    'Stockholm': 'Sweden', 'Copenhagen': 'Denmark', 'Oslo': 'Norway', 'Helsinki': 'Finland',
    'Reykjavik': 'Iceland', 'Bergen': 'Norway', 'Gothenburg': 'Sweden', 'Malmö': 'Sweden',
    // Europe - Eastern Europe
    'Prague': 'Czech Republic', 'Budapest': 'Hungary', 'Krakow': 'Poland', 'Warsaw': 'Poland',
    'Dubrovnik': 'Croatia', 'Split': 'Croatia', 'Bucharest': 'Romania', 'Sofia': 'Bulgaria',
    'Tallinn': 'Estonia', 'Riga': 'Latvia', 'Vilnius': 'Lithuania',
    // Europe - Greece
    'Athens': 'Greece', 'Santorini': 'Greece', 'Mykonos': 'Greece', 'Crete': 'Greece',
    'Rhodes': 'Greece', 'Corfu': 'Greece', 'Thessaloniki': 'Greece',
    // Europe - Other
    'Istanbul': 'Turkey', 'Moscow': 'Russia', 'St Petersburg': 'Russia',
    // Japan
    'Tokyo': 'Japan', 'Kyoto': 'Japan', 'Osaka': 'Japan', 'Hiroshima': 'Japan', 'Nara': 'Japan',
    'Yokohama': 'Japan', 'Sapporo': 'Japan', 'Fukuoka': 'Japan', 'Nikko': 'Japan', 'Hakone': 'Japan',
    // South Korea
    'Seoul': 'South Korea', 'Busan': 'South Korea', 'Jeju Island': 'South Korea', 'Incheon': 'South Korea',
    'Daegu': 'South Korea', 'Gyeongju': 'South Korea',
    // Southeast Asia
    'Bangkok': 'Thailand', 'Phuket': 'Thailand', 'Chiang Mai': 'Thailand', 'Krabi': 'Thailand',
    'Koh Samui': 'Thailand', 'Pattaya': 'Thailand', 'Singapore': 'Singapore',
    'Hanoi': 'Vietnam', 'Ho Chi Minh': 'Vietnam', 'Hoi An': 'Vietnam', 'Da Nang': 'Vietnam',
    'Nha Trang': 'Vietnam', 'Sapa': 'Vietnam', 'Ha Long Bay': 'Vietnam',
    'Kuala Lumpur': 'Malaysia', 'Penang': 'Malaysia', 'Langkawi': 'Malaysia',
    'Manila': 'Philippines', 'Boracay': 'Philippines', 'Palawan': 'Philippines',
    'Jakarta': 'Indonesia', 'Bali': 'Indonesia', 'Yogyakarta': 'Indonesia',
    'Siem Reap': 'Cambodia', 'Phnom Penh': 'Cambodia', 'Yangon': 'Myanmar', 'Bagan': 'Myanmar',
    'Luang Prabang': 'Laos', 'Vientiane': 'Laos',
    // China
    'Hong Kong': 'China', 'Shanghai': 'China', 'Beijing': 'China', 'Guangzhou': 'China',
    'Shenzhen': 'China', 'Chengdu': 'China', 'Xi\'an': 'China', 'Guilin': 'China',
    'Hangzhou': 'China', 'Macau': 'China',
    // Middle East
    'Dubai': 'UAE', 'Abu Dhabi': 'UAE', 'Doha': 'Qatar', 'Muscat': 'Oman',
    'Tel Aviv': 'Israel', 'Jerusalem': 'Israel', 'Petra': 'Jordan', 'Amman': 'Jordan',
    // Other Asia
    'Taipei': 'Taiwan', 'Kathmandu': 'Nepal', 'Colombo': 'Sri Lanka', 'Maldives': 'Maldives',
    // Canada
    'Vancouver': 'Canada', 'Toronto': 'Canada', 'Montreal': 'Canada', 'Quebec City': 'Canada',
    'Calgary': 'Canada', 'Ottawa': 'Canada', 'Whistler': 'Canada', 'Banff': 'Canada',
    'Victoria': 'Canada', 'Halifax': 'Canada', 'Edmonton': 'Canada', 'Niagara Falls': 'Canada',
    // Mexico
    'Mexico City': 'Mexico', 'Cancun': 'Mexico', 'Playa del Carmen': 'Mexico', 'Guadalajara': 'Mexico',
    'Oaxaca': 'Mexico', 'San Miguel de Allende': 'Mexico', 'Tulum': 'Mexico', 'Puerto Vallarta': 'Mexico',
    'Cabo San Lucas': 'Mexico', 'Monterrey': 'Mexico', 'Guanajuato': 'Mexico', 'Merida': 'Mexico',
    // South America
    'Buenos Aires': 'Argentina', 'Rio de Janeiro': 'Brazil', 'Lima': 'Peru', 'Santiago': 'Chile',
    'Bogotá': 'Colombia', 'Medellín': 'Colombia', 'Cusco': 'Peru', 'Quito': 'Ecuador',
    'Cartagena': 'Colombia', 'Montevideo': 'Uruguay', 'La Paz': 'Bolivia', 'São Paulo': 'Brazil',
    // New Zealand
    'Auckland': 'New Zealand', 'Wellington': 'New Zealand', 'Christchurch': 'New Zealand',
    'Queenstown': 'New Zealand', 'Rotorua': 'New Zealand', 'Taupo': 'New Zealand',
    'Nelson': 'New Zealand', 'Dunedin': 'New Zealand', 'Hamilton': 'New Zealand',
    'Palmerston North': 'New Zealand', 'Milford Sound': 'New Zealand', 'Mount Cook': 'New Zealand',
    // Africa
    'Cape Town': 'South Africa', 'Cairo': 'Egypt', 'Marrakech': 'Morocco'
  }
  return cityToCountry[city] || 'Unknown'
}

const getCurrencyForContinent = (continent) => {
  const currencies = {
    'Europe': 'EUR',
    'Asia': 'USD',
    'North America': 'USD',
    'South America': 'USD',
    'Africa': 'USD',
    'Oceania': 'AUD'
  }
  return currencies[continent] || 'USD'
}

const getBestTimeToVisit = (continent) => {
  const times = {
    'Europe': 'April-September',
    'Asia': 'October-March',
    'North America': 'May-September',
    'South America': 'December-March',
    'Africa': 'May-October',
    'Oceania': 'December-February'
  }
  return times[continent] || 'Year-round'
}

const getRandomActivities = () => {
  const activities = ['Sightseeing', 'Adventure', 'Culture', 'Food', 'Nature', 'Shopping', 'Nightlife', 'Beach', 'Hiking', 'Museums']
  return activities.sort(() => 0.5 - Math.random()).slice(0, 3)
}

// Image generation helpers using reliable Unsplash API
const getCityImage = (city) => {
  // Direct Unsplash image URLs with verified photo IDs for each city
  const cityImageMap = {
    // INDIA - Verified working Unsplash images
    'Mumbai': 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800&h=600&fit=crop', // Gateway of India
    'Delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop', // India Gate
    'Bangalore': 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&h=600&fit=crop&q=80', // Bangalore cityscape
    'Hyderabad': 'https://images.unsplash.com/photo-1585468274952-66591eb14a6e?w=800&h=600&fit=crop', // Charminar
    'Chennai': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop', // Marina Beach
    'Kolkata': 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&h=600&fit=crop', // Victoria Memorial
    'Pune': 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800&h=600&fit=crop', // Pune city
    'Ahmedabad': 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&h=600&fit=crop', // Ahmedabad
    'Jaipur': 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&h=600&fit=crop', // Hawa Mahal
    'Goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop', // Goa beach
    'Udaipur': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=600&fit=crop', // Lake Palace
    'Agra': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=600&fit=crop', // Taj Mahal
    'Varanasi': 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&h=600&fit=crop', // Varanasi Ghats

    // USA
    'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop', // NYC skyline
    'Los Angeles': 'https://images.unsplash.com/photo-1534190239940-9ba8944ea261?w=800&h=600&fit=crop', // LA cityscape
    'San Francisco': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop', // Golden Gate
    'Las Vegas': 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=800&h=600&fit=crop', // Vegas strip
    'Miami': 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&h=600&fit=crop', // Miami beach
    'Chicago': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop', // Chicago skyline
    'Seattle': 'https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?w=800&h=600&fit=crop', // Space Needle
    'Boston': 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop', // Boston
    'Washington DC': 'https://images.unsplash.com/photo-1617581629397-a72507c3de9e?w=800&h=600&fit=crop', // DC Capitol
    'New Orleans': 'https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?w=800&h=600&fit=crop', // NOLA
    'Austin': 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=800&h=600&fit=crop', // Austin

    // AUSTRALIA
    'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop', // Opera House
    'Melbourne': 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800&h=600&fit=crop', // Melbourne
    'Brisbane': 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800&h=600&fit=crop', // Brisbane
    'Perth': 'https://images.unsplash.com/photo-1573074617613-3f6c6c33161e?w=800&h=600&fit=crop', // Perth
    'Adelaide': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop', // Adelaide
    'Gold Coast': 'https://images.unsplash.com/photo-1583278001164-f78d23c3218e?w=800&h=600&fit=crop', // Gold Coast
    'Cairns': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop', // Cairns

    // EUROPE - France
    'Paris': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&h=600&fit=crop', // Eiffel Tower
    'Nice': 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop', // Nice
    'Lyon': 'https://images.unsplash.com/photo-1524396309943-e03f5249f002?w=800&h=600&fit=crop', // Lyon
    'Bordeaux': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&h=600&fit=crop', // Bordeaux

    // EUROPE - UK & Ireland
    'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop', // Big Ben
    'Edinburgh': 'https://images.unsplash.com/photo-1580719879439-62316d8bdc3a?w=800&h=600&fit=crop', // Edinburgh
    'Dublin': 'https://images.unsplash.com/photo-1549918864-48ac978761a4?w=800&h=600&fit=crop', // Dublin
    'Manchester': 'https://images.unsplash.com/photo-1579282240050-352db0a14c21?w=800&h=600&fit=crop', // Manchester

    // EUROPE - Italy
    'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop', // Colosseum
    'Venice': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop', // Venice
    'Florence': 'https://images.unsplash.com/photo-1541960071727-c531398e7494?w=800&h=600&fit=crop', // Florence
    'Milan': 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800&h=600&fit=crop', // Milan
    'Naples': 'https://images.unsplash.com/photo-1608577189299-9e56d2e59c0f?w=800&h=600&fit=crop', // Naples

    // EUROPE - Spain
    'Barcelona': 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=800&h=600&fit=crop', // Sagrada Familia
    'Madrid': 'https://images.unsplash.com/photo-1543429258-3211e9c78b38?w=800&h=600&fit=crop', // Madrid
    'Seville': 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=600&fit=crop', // Seville
    'Valencia': 'https://images.unsplash.com/photo-1590503820142-c49e1bfd99d3?w=800&h=600&fit=crop', // Valencia

    // EUROPE - Portugal
    'Lisbon': 'https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?w=800&h=600&fit=crop', // Lisbon
    'Porto': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&h=600&fit=crop', // Porto

    // EUROPE - Germany
    'Berlin': 'https://images.unsplash.com/photo-1519112232436-9923c6ba3d26?w=800&h=600&fit=crop', // Brandenburg Gate
    'Munich': 'https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800&h=600&fit=crop', // Munich
    'Hamburg': 'https://images.unsplash.com/photo-1544980919-e17526d4ed0a?w=800&h=600&fit=crop', // Hamburg

    // EUROPE - Netherlands & Belgium
    'Amsterdam': 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop', // Amsterdam canals
    'Brussels': 'https://images.unsplash.com/photo-1559113202-e3f38aca1117?w=800&h=600&fit=crop', // Brussels
    'Bruges': 'https://images.unsplash.com/photo-1580748111874-e5935d148bbe?w=800&h=600&fit=crop', // Bruges

    // EUROPE - Switzerland & Austria
    'Zurich': 'https://images.unsplash.com/photo-1508726096737-5ac7ca26345f?w=800&h=600&fit=crop', // Zurich
    'Geneva': 'https://images.unsplash.com/photo-1561842220-bc0ab7c8e14a?w=800&h=600&fit=crop', // Geneva
    'Vienna': 'https://images.unsplash.com/photo-1609856878074-cf31e21ccb6b?w=800&h=600&fit=crop', // Vienna
    'Salzburg': 'https://images.unsplash.com/photo-1542795971-d9b0f0e3f0e6?w=800&h=600&fit=crop', // Salzburg

    // EUROPE - Scandinavia
    'Stockholm': 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&h=600&fit=crop', // Stockholm
    'Copenhagen': 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800&h=600&fit=crop', // Copenhagen
    'Oslo': 'https://images.unsplash.com/photo-1578439297170-a97eb44a39c7?w=800&h=600&fit=crop', // Oslo
    'Helsinki': 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=800&h=600&fit=crop', // Helsinki
    'Reykjavik': 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&h=600&fit=crop', // Reykjavik

    // EUROPE - Eastern Europe
    'Prague': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop', // Prague
    'Budapest': 'https://images.unsplash.com/photo-1541423168575-c9a1e980a7c0?w=800&h=600&fit=crop', // Budapest
    'Krakow': 'https://images.unsplash.com/photo-1544986581-efac024faf62?w=800&h=600&fit=crop', // Krakow
    'Warsaw': 'https://images.unsplash.com/photo-1575567356928-8b0b1d6ab160?w=800&h=600&fit=crop', // Warsaw

    // EUROPE - Greece
    'Athens': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=600&fit=crop', // Parthenon
    'Santorini': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop', // Santorini
    'Mykonos': 'https://images.unsplash.com/photo-1556702314-e0c1e4c92d6e?w=800&h=600&fit=crop', // Mykonos

    // ASIA - Japan
    'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop', // Tokyo
    'Kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop', // Kyoto
    'Osaka': 'https://images.unsplash.com/photo-1589452271712-64b8a66c7b71?w=800&h=600&fit=crop', // Osaka

    // ASIA - South Korea
    'Seoul': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&h=600&fit=crop', // Seoul
    'Busan': 'https://images.unsplash.com/photo-1608706898047-0075485a4470?w=800&h=600&fit=crop', // Busan

    // ASIA - Southeast Asia
    'Bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop', // Bangkok
    'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop', // Marina Bay
    'Bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop', // Bali
    'Phuket': 'https://images.unsplash.com/photo-1558640774-8e3eb136fc32?w=800&h=600&fit=crop', // Phuket
    'Hanoi': 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop', // Hanoi

    // ASIA - China
    'Hong Kong': 'https://images.unsplash.com/photo-1518083165041-2a9c0c2b9a42?w=800&h=600&fit=crop', // Hong Kong
    'Shanghai': 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=800&h=600&fit=crop', // Shanghai
    'Beijing': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=600&fit=crop', // Beijing

    // ASIA - Middle East
    'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop', // Burj Khalifa
    'Abu Dhabi': 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop', // Abu Dhabi
    'Istanbul': 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=800&h=600&fit=crop', // Blue Mosque

    // CANADA
    'Vancouver': 'https://images.unsplash.com/photo-1494256997604-768d1f608cac?w=800&h=600&fit=crop', // Vancouver
    'Toronto': 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&h=600&fit=crop', // CN Tower
    'Montreal': 'https://images.unsplash.com/photo-1562832135-14a35d25edef?w=800&h=600&fit=crop', // Montreal

    // MEXICO
    'Mexico City': 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&h=600&fit=crop', // Mexico City
    'Cancun': 'https://images.unsplash.com/photo-1568952433726-3896e3881c65?w=800&h=600&fit=crop', // Cancun
  }

  // Return city-specific image if available, otherwise return generic cityscape
  return cityImageMap[city] || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'
}

const getNeighborhoodImage = (city, typeKey) => {
  // Use city-specific image for major cities instead of generic type-based images
  // This ensures all Bangalore neighborhoods show Bangalore images, etc.
  return getCityImage(city)
}

const getDistrictImage = (city, typeKey) => {
  // Reuse neighborhood images for districts
  return getNeighborhoodImage(city, typeKey)
}

const getHotelImage = (type) => {
  // Map hotel types to specific Unsplash images
  const hotelImages = {
    'Luxury': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&auto=format&q=60',
    'Business': 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=400&h=300&fit=crop&auto=format&q=60',
    'Boutique': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop&auto=format&q=60',
    'Budget': 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=400&h=300&fit=crop&auto=format&q=60',
    'Resort': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop&auto=format&q=60'
  }

  return hotelImages[type] || hotelImages['Business']
}

// Fetch real-time attraction data from Google Places API
export const fetchAttractionData = async (cityName, attractionName) => {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('Google Places API key not configured. Using fallback data.')
    return generateFallbackAttractionData(attractionName)
  }

  try {
    // Using Text Search API
    const searchQuery = `${attractionName} in ${cityName}`
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json`,
      {
        params: {
          query: searchQuery,
          key: GOOGLE_PLACES_API_KEY
        }
      }
    )

    if (response.data.results && response.data.results.length > 0) {
      const place = response.data.results[0]

      // Get detailed information
      const detailsResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: {
            place_id: place.place_id,
            fields: 'name,rating,user_ratings_total,formatted_address,price_level,opening_hours,photos,types,website',
            key: GOOGLE_PLACES_API_KEY
          }
        }
      )

      const details = detailsResponse.data.result

      return {
        name: details.name || attractionName,
        rating: details.rating || 4.5,
        reviews: details.user_ratings_total || 0,
        address: details.formatted_address || '',
        priceLevel: details.price_level || 2,
        estimatedCost: estimateCostFromPriceLevel(details.price_level),
        openingHours: details.opening_hours?.weekday_text || [],
        isOpen: details.opening_hours?.open_now || null,
        photos: details.photos?.map(photo =>
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
        ) || [],
        types: details.types || [],
        website: details.website || null,
        coordinates: {
          lat: place.geometry?.location?.lat || 0,
          lng: place.geometry?.location?.lng || 0
        }
      }
    }

    return generateFallbackAttractionData(attractionName)
  } catch (error) {
    console.error('Error fetching from Google Places API:', error)
    return generateFallbackAttractionData(attractionName)
  }
}

// Generate fallback attraction data when API is not available
const generateFallbackAttractionData = (attractionName) => {
  return {
    name: attractionName,
    rating: (4.0 + Math.random() * 1.0).toFixed(1),
    reviews: Math.floor(Math.random() * 5000) + 500,
    address: 'See on map',
    priceLevel: Math.floor(Math.random() * 4) + 1,
    estimatedCost: Math.floor(Math.random() * 50) + 10,
    openingHours: [
      'Monday: 9:00 AM – 6:00 PM',
      'Tuesday: 9:00 AM – 6:00 PM',
      'Wednesday: 9:00 AM – 6:00 PM',
      'Thursday: 9:00 AM – 6:00 PM',
      'Friday: 9:00 AM – 6:00 PM',
      'Saturday: 10:00 AM – 8:00 PM',
      'Sunday: 10:00 AM – 6:00 PM'
    ],
    isOpen: Math.random() > 0.3,
    photos: ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop&q=60'],
    types: ['tourist_attraction', 'point_of_interest'],
    website: null,
    coordinates: { lat: 0, lng: 0 }
  }
}

// Estimate cost from Google's price_level (0-4 scale)
const estimateCostFromPriceLevel = (priceLevel) => {
  const costMap = {
    0: 0,      // Free
    1: 15,     // Inexpensive ($)
    2: 30,     // Moderate ($$)
    3: 60,     // Expensive ($$$)
    4: 100     // Very Expensive ($$$$)
  }
  return costMap[priceLevel] || 25
}
