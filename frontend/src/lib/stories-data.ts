export interface Story {
  id: string;
  title: string;
  destination: string;
  excerpt: string;
  coverImage: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  duration: string;
  budget: number;
  readTime: string;
  date: string;
  category: 'Backpacking' | 'Mountain Trails' | 'Weekend Escapes' | 'Budget Guides';
  tags: string[];
  content?: {
    introduction: string;
    highlights: string[];
    sections: {
      title: string;
      body: string;
      image?: string;
    }[];
    budgetBreakdown: {
      category: string;
      cost: number;
    }[];
  };
}

export const SAMPLE_STORIES: Story[] = [
  {
    id: 'old-manali-under-20k',
    title: '7 Days in Old Manali Under ₹20,000: The Complete Backpacker Guide',
    destination: 'Old Manali, Himachal Pradesh',
    excerpt: 'From taking the overnight HRTC Volvo bus from Delhi to sipping hot Kahwa in rustic cafes — here is how I spent a whole week in Old Manali without exceeding my student budget.',
    coverImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop',
    author: {
      name: 'Aarav Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      role: 'Budget Backpacker'
    },
    duration: '7 Days / 6 Nights',
    budget: 19090,
    readTime: '5 min read',
    date: 'Oct 02, 2026',
    category: 'Backpacking',
    tags: ['Himachal', 'Sangli to Manali', 'Backpacking', 'Under ₹20k'],
    content: {
      introduction: 'Taking a trip from a Tier-3 city in Maharashtra all the way up to the snow-capped pine forests of Old Manali always seemed like an expensive dream. But by smartly connecting local trains to Delhi and booking comfortable local homestays in Manali, I managed a 7-day mountain getaway for under ₹20,000 total.',
      highlights: [
        'Direct train from Miraj Junction to Delhi ISBT hub',
        'Stayed in a cozy wooden riverside hostel in Old Manali',
        'Daily hikes to Hadimba Temple & Jogini Waterfall',
        'Local Himachali Siddu and Trout tasting'
      ],
      sections: [
        {
          title: 'The Journey: Sangli to Delhi & Beyond',
          body: 'I started my journey from Sangli, taking a quick ₹40 local auto shuttle to Miraj Junction. From Miraj, the Goa Express took me straight to New Delhi. After a brief transit via the Delhi Metro to Kashmere Gate ISBT, I boarded the evening HRTC Volvo bus to Manali.',
          image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop'
        },
        {
          title: 'Settling in Old Manali & Local Eats',
          body: 'Old Manali is far quieter and more peaceful than the crowded Mall Road down below. I checked into a standard cozy guest house overlooking apple orchards for ₹1,200 per night. Breakfasts were spent enjoying fresh woodfired pizzas and hot Himalayan tea.',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop'
        }
      ],
      budgetBreakdown: [
        { category: 'Multi-Modal Transport (Trains, Buses, Shuttles)', cost: 2190 },
        { category: 'Homestay & Hostel (6 Nights)', cost: 9000 },
        { category: 'Food & Mountain Cafes', cost: 4900 },
        { category: 'Local Sightseeing & Trek Shuttles', cost: 2000 },
        { category: 'Contingency Reserve', cost: 1000 }
      ]
    }
  },
  {
    id: 'pune-heritage-weekend',
    title: 'A Slow Weekend Through Pune Cafes and Heritage Fort Ruins',
    destination: 'Pune, Maharashtra',
    excerpt: 'Explore Shaniwar Wada, cafe-hop in Koregaon Park, and trek Sinhagad Fort — all connected seamlessly via Pune Metro and local city buses for under ₹5,000.',
    coverImage: 'https://images.unsplash.com/photo-1588416936097-41850ab3d86d?q=80&w=1200&auto=format&fit=crop',
    author: {
      name: 'Priya Deshmukh',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
      role: 'Culture & Heritage Explorer'
    },
    duration: '3 Days / 2 Nights',
    budget: 4800,
    readTime: '4 min read',
    date: 'Sep 28, 2026',
    category: 'Weekend Escapes',
    tags: ['Maharashtra', 'Pune', 'Heritage', 'Under ₹5k'],
    content: {
      introduction: 'Pune is a goldmine for heritage lovers and foodies alike. Whether you are traveling from Sangli, Mumbai, or Nashik, Pune offers the perfect low-budget weekend retreat.',
      highlights: [
        'Early morning Sinhagad Fort sunrise trek',
        'Authentic Misal Pav at classic local eateries',
        'Shaniwar Wada & Aga Khan Palace photo walks'
      ],
      sections: [
        {
          title: 'Exploring Old Pune & Peshwa History',
          body: 'Start your morning in the historic Peth areas. Walking through the narrow streets around Shaniwar Wada feels like stepping back 200 years.',
          image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop'
        }
      ],
      budgetBreakdown: [
        { category: 'Train / Bus Transport', cost: 800 },
        { category: 'Budget Hotel (2 Nights)', cost: 2200 },
        { category: 'Food & Local Dining', cost: 1200 },
        { category: 'Entry Tickets & Local Transit', cost: 600 }
      ]
    }
  },
  {
    id: 'chandigarh-to-manali-road-trip',
    title: 'Navigating the Scenic Himachal Highway: Chandigarh to Manali Transit',
    destination: 'Chandigarh to Manali',
    excerpt: 'A practical travel log on switching from broad-gauge trains at Chandigarh Junction to Himalayan mountain buses through Mandi and Kullu Valley.',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    author: {
      name: 'Rohan Mehta',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      role: 'Transit & Route Strategist'
    },
    duration: '5 Days / 4 Nights',
    budget: 14500,
    readTime: '6 min read',
    date: 'Sep 15, 2026',
    category: 'Mountain Trails',
    tags: ['Chandigarh', 'Manali', 'Transit Guide', 'Under ₹15k'],
    content: {
      introduction: 'Transitioning from the plains of Punjab into the high valleys of Himachal is one of India\'s most rewarding transit experiences.',
      highlights: [
        'Exploring Chandigarh\'s Rock Garden before catching night bus',
        'Winding road journeys along the Beas River',
        'Budget-friendly cafe recommendations in Vashisht'
      ],
      sections: [
        {
          title: 'Schedules & Safe Transfers',
          body: 'Making sure your train arrival at Chandigarh gives you at least 2 hours of buffer before the mountain bus departs is crucial for avoiding stressful transfers.',
          image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop'
        }
      ],
      budgetBreakdown: [
        { category: 'Train & Bus Tickets', cost: 1850 },
        { category: 'Stay in Manali', cost: 6800 },
        { category: 'Food & Snacks', cost: 3800 },
        { category: 'Local Cabs & Sightseeing', cost: 2050 }
      ]
    }
  },
  {
    id: 'delhi-heritage-street-food',
    title: 'Old Delhi Street Food & Heritage Crawl for Under ₹3,000',
    destination: 'Delhi ISBT & Chandni Chowk',
    excerpt: 'How to make the most of a 24-hour transit layover in Delhi: Jama Masjid, Chandni Chowk Paranthe Wali Gali, and Red Fort using Delhi Metro.',
    coverImage: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1200&auto=format&fit=crop',
    author: {
      name: 'Sneha Kulkarni',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
      role: 'Food & Urban Explorer'
    },
    duration: '2 Days / 1 Night',
    budget: 3200,
    readTime: '3 min read',
    date: 'Sep 05, 2026',
    category: 'Budget Guides',
    tags: ['Delhi', 'Food Crawl', 'Metro Guide', 'Under ₹5k'],
    content: {
      introduction: 'Got a long layover between your south/west India train and your North India mountain bus? Turn that layover into a legendary Delhi food crawl.',
      highlights: [
        'Delhi Metro Tourist Day Card for unlimited travel',
        'Famous Daulat Ki Chaat in Chandni Chowk',
        'Sunset views from the minaret of Jama Masjid'
      ],
      sections: [
        {
          title: 'Navigating Metro Layover',
          body: 'Store your heavy luggage safely at the Delhi ISBT or New Delhi Railway Station cloakroom before setting off into Old Delhi with just a daypack.',
          image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1000&auto=format&fit=crop'
        }
      ],
      budgetBreakdown: [
        { category: 'Metro Pass & Auto Shuttles', cost: 350 },
        { category: 'Budget Transit Hotel', cost: 1400 },
        { category: 'Street Food & Meals', cost: 1100 },
        { category: 'Monuments Tickets', cost: 350 }
      ]
    }
  }
];
