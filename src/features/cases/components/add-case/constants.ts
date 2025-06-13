// Case type to sub-type mapping based on your Supabase data
export const CASE_SUB_TYPES = {
  'Disinformation': [
    'DeepFake Image',
    'DeepFake Video', 
    'Voice Cloning',
    'Fake News Publication',
    'Social Media Manipulation'
  ],
  'Cybercrime': [
    'Phishing Attempt',
    'Account Takeover',
    'Malware Injection',
    'Ransomware Attack',
    'System Breach'
  ],
  'Terrorism': [
    'Bomb Threat',
    'Video Manifesto Circulation',
    'Coordinated Attack Claim',
    'Propaganda DeepFake'
  ],
  'Financial Fraud': [
    'Fake Loan Application',
    'DeepFake CEO Scam',
    'Credit Card Fraud',
    'Cryptocurrency Scam'
  ],
  'Impersonation': [
    'Synthetic Identity',
    'Altered Passport',
    'Fake Interview Footage'
  ],
  'Internal Risk': [
    'Whistleblower Misuse'
  ]
};

// Comprehensive world data
export const WORLD_DATA = {
  countries: [
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Bolivia', 'Brazil', 'Bulgaria', 'Cambodia',
    'Canada', 'Chile', 'China', 'Colombia', 'Croatia', 'Czech Republic', 'Denmark', 'Ecuador',
    'Egypt', 'Estonia', 'Ethiopia', 'Finland', 'France', 'Georgia', 'Germany', 'Ghana',
    'Greece', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
    'Israel', 'Italy', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Latvia',
    'Lebanon', 'Lithuania', 'Luxembourg', 'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand',
    'Nigeria', 'Norway', 'Pakistan', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
    'Romania', 'Russia', 'Saudi Arabia', 'Singapore', 'Slovakia', 'Slovenia', 'South Africa', 'South Korea',
    'Spain', 'Sri Lanka', 'Sweden', 'Switzerland', 'Thailand', 'Turkey', 'Ukraine', 'United Arab Emirates',
    'United Kingdom', 'United States', 'Uruguay', 'Venezuela', 'Vietnam'
  ],
  states: {
    'United States': [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
      'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas',
      'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
      'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
      'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
      'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
      'Wisconsin', 'Wyoming'
    ],
    'Canada': [
      'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
      'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
      'Quebec', 'Saskatchewan', 'Yukon'
    ],
    'Australia': [
      'New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia',
      'Tasmania', 'Northern Territory', 'Australian Capital Territory'
    ],
    'Germany': [
      'Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg',
      'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia',
      'Rhineland-Palatinate', 'Saarland', 'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia'
    ],
    'United Kingdom': [
      'England', 'Scotland', 'Wales', 'Northern Ireland'
    ],
    'India': [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
      'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
      'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
      'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    ],
    'China': [
      'Anhui', 'Beijing', 'Chongqing', 'Fujian', 'Gansu', 'Guangdong', 'Guangxi',
      'Guizhou', 'Hainan', 'Hebei', 'Heilongjiang', 'Henan', 'Hubei', 'Hunan',
      'Inner Mongolia', 'Jiangsu', 'Jiangxi', 'Jilin', 'Liaoning', 'Ningxia',
      'Qinghai', 'Shaanxi', 'Shandong', 'Shanghai', 'Shanxi', 'Sichuan', 'Tianjin',
      'Tibet', 'Xinjiang', 'Yunnan', 'Zhejiang'
    ],
    'France': [
      'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Brittany', 'Centre-Val de Loire',
      'Corsica', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandy',
      'Nouvelle-Aquitaine', 'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur'
    ]
  },
  cities: {
    'California': [
      'Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose', 'Fresno',
      'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim', 'Santa Ana', 'Riverside',
      'Stockton', 'Irvine', 'Chula Vista', 'Fremont', 'San Bernardino', 'Modesto'
    ],
    'New York': [
      'New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany',
      'New Rochelle', 'Mount Vernon', 'Schenectady', 'Utica', 'White Plains', 'Hempstead'
    ],
    'Texas': [
      'Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso',
      'Arlington', 'Corpus Christi', 'Plano', 'Lubbock', 'Laredo', 'Irving'
    ],
    'Ontario': [
      'Toronto', 'Ottawa', 'Hamilton', 'London', 'Markham', 'Vaughan',
      'Kitchener', 'Windsor', 'Richmond Hill', 'Oakville', 'Burlington', 'Oshawa'
    ],
    'Bavaria': [
      'Munich', 'Nuremberg', 'Augsburg', 'Würzburg', 'Regensburg', 'Ingolstadt',
      'Fürth', 'Erlangen', 'Bayreuth', 'Bamberg', 'Aschaffenburg', 'Landshut'
    ],
    'England': [
      'London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool', 'Sheffield',
      'Bristol', 'Newcastle', 'Nottingham', 'Leicester', 'Coventry', 'Bradford'
    ],
    'Maharashtra': [
      'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur',
      'Amravati', 'Kolhapur', 'Sangli', 'Jalgaon', 'Akola', 'Latur'
    ],
    'Guangdong': [
      'Guangzhou', 'Shenzhen', 'Dongguan', 'Foshan', 'Zhongshan', 'Zhuhai',
      'Jiangmen', 'Huizhou', 'Zhaoqing', 'Maoming', 'Jieyang', 'Chaozhou'
    ]
  }
};

// Location-based address suggestions
export const LOCATION_ADDRESSES = {
  'Los Angeles': [
    '123 Hollywood Boulevard', '456 Sunset Strip', '789 Melrose Avenue', '321 Beverly Hills Drive',
    '654 Santa Monica Boulevard', '987 Rodeo Drive', '147 Vine Street', '258 La Brea Avenue'
  ],
  'New York City': [
    '123 Broadway', '456 Fifth Avenue', '789 Park Avenue', '321 Madison Avenue',
    '654 Lexington Avenue', '987 Wall Street', '147 Times Square', '258 Central Park West'
  ],
  'London': [
    '123 Oxford Street', '456 Regent Street', '789 Bond Street', '321 Piccadilly',
    '654 Baker Street', '987 King\'s Road', '147 Carnaby Street', '258 Portobello Road'
  ],
  'Mumbai': [
    '123 Marine Drive', '456 Linking Road', '789 Carter Road', '321 Hill Road',
    '654 S.V. Road', '987 Western Express Highway', '147 Andheri Link Road', '258 Juhu Beach Road'
  ],
  'Toronto': [
    '123 Yonge Street', '456 Queen Street West', '789 King Street', '321 Bloor Street',
    '654 College Street', '987 Dundas Street', '147 Bay Street', '258 Front Street'
  ]
}; 