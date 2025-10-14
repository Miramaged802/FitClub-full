# Egyptian Gyms with Google Maps Integration

This application now features Egyptian gyms with EGP pricing and integrated Google Maps functionality.

## Features

- **Egyptian Gym Listings**: 10+ gyms across major Egyptian cities including Cairo, Alexandria, Giza, Hurghada, and more
- **EGP Pricing**: All prices displayed in Egyptian Pounds (EGP) with monthly and yearly options
- **Google Maps Integration**: Interactive map showing gym locations with info windows
- **Advanced Filtering**: Filter by city, amenities, rating, and distance
- **Detailed Gym Pages**: Complete gym information including pricing, amenities, classes, and contact details

## Google Maps Setup

To enable Google Maps functionality:

1. **Get a Google Maps API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the "Maps JavaScript API" and "Places API"
   - Create credentials (API Key)

2. **Configure the API Key**:
   - Open `src/pages/Gyms.jsx`
   - Find line with `apiKey: "YOUR_GOOGLE_MAPS_API_KEY"`
   - Replace `"YOUR_GOOGLE_MAPS_API_KEY"` with your actual API key

3. **Optional: Restrict API Key**:
   - In Google Cloud Console, restrict your API key to your domain
   - Enable only the APIs you need (Maps JavaScript API, Places API)

## Egyptian Gyms Included

### Cairo
- **Gold's Gym New Cairo** - 1,200 EGP/month - Premium facility with spa and pool
- **Fitness First Maadi** - 950 EGP/month - Modern gym with group classes
- **California Gym Zamalek** - 1,500 EGP/month - Luxury 24/7 gym with Nile views
- **Oxygen Gym Heliopolis** - 900 EGP/month - Aqua fitness specialist

### Giza
- **Body Masters Giza** - 1,100 EGP/month - CrossFit and strength training focus

### Alexandria
- **Smart Gym Alexandria** - 800 EGP/month - Comprehensive fitness programs

### Other Cities
- **Platinum Gym New Administrative Capital** - 1,400 EGP/month
- **Flex Gym Hurghada** - 700 EGP/month
- **Power Zone Mansoura** - 650 EGP/month
- **Elite Fitness Sharm El Sheikh** - 850 EGP/month

## Running the Application

```bash
npm install
npm run dev
```

## Features Included

- **Map Toggle**: Show/hide interactive Google Maps
- **City Filtering**: Filter gyms by Egyptian cities
- **Price Display**: Monthly and yearly pricing in EGP
- **Contact Information**: Phone numbers, emails, websites, and social media
- **Class Schedules**: Today's fitness classes with instructors
- **Amenities**: Complete list of gym facilities
- **Rating System**: Star ratings and review counts

## Data Structure

Gym data is centralized in `src/data/gymsData.js` and includes:

- Basic information (name, description, images)
- Location and coordinates for maps
- Pricing in EGP (monthly/yearly)
- Contact details (Egyptian phone numbers, local emails)
- Operating hours
- Amenities and facilities
- Class schedules with local instructors
- Ratings and reviews

The application automatically displays the first gym image in cards and provides a full gallery in detail pages. 