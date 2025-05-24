const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const City = require('./models/City');
require('dotenv').config();

const initializeData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/flyticket');
    console.log('Connected to MongoDB');

    // Create initial cities if they don't exist
    const cities = [
      { city_id: 'ADN', city_name: 'Adana' },
      { city_id: 'ADI', city_name: 'Adıyaman' },
      { city_id: 'AFY', city_name: 'Afyonkarahisar' },
      { city_id: 'AGR', city_name: 'Ağrı' },
      { city_id: 'AKS', city_name: 'Aksaray' },
      { city_id: 'AMA', city_name: 'Amasya' },
      { city_id: 'ANK', city_name: 'Ankara' },
      { city_id: 'ANT', city_name: 'Antalya' },
      { city_id: 'ARD', city_name: 'Ardahan' },
      { city_id: 'ART', city_name: 'Artvin' },
      { city_id: 'AYD', city_name: 'Aydın' },
      { city_id: 'BAL', city_name: 'Balıkesir' },
      { city_id: 'BAR', city_name: 'Bartın' },
      { city_id: 'BAT', city_name: 'Batman' },
      { city_id: 'BAY', city_name: 'Bayburt' },
      { city_id: 'BIL', city_name: 'Bilecik' },
      { city_id: 'BIN', city_name: 'Bingöl' },
      { city_id: 'BIT', city_name: 'Bitlis' },
      { city_id: 'BOL', city_name: 'Bolu' },
      { city_id: 'BRD', city_name: 'Burdur' },
      { city_id: 'BRS', city_name: 'Bursa' },
      { city_id: 'CAN', city_name: 'Çanakkale' },
      { city_id: 'CRT', city_name: 'Çankırı' },
      { city_id: 'COR', city_name: 'Çorum' },
      { city_id: 'DEN', city_name: 'Denizli' },
      { city_id: 'DIY', city_name: 'Diyarbakır' },
      { city_id: 'DUZ', city_name: 'Düzce' },
      { city_id: 'EDI', city_name: 'Edirne' },
      { city_id: 'ELA', city_name: 'Elazığ' },
      { city_id: 'ERI', city_name: 'Erzincan' },
      { city_id: 'ERZ', city_name: 'Erzurum' },
      { city_id: 'ESK', city_name: 'Eskişehir' },
      { city_id: 'GAZ', city_name: 'Gaziantep' },
      { city_id: 'GIR', city_name: 'Giresun' },
      { city_id: 'GMS', city_name: 'Gümüşhane' },
      { city_id: 'HAK', city_name: 'Hakkari' },
      { city_id: 'HAT', city_name: 'Hatay' },
      { city_id: 'IGD', city_name: 'Iğdır' },
      { city_id: 'ISP', city_name: 'Isparta' },
      { city_id: 'IST', city_name: 'İstanbul' },
      { city_id: 'IZM', city_name: 'İzmir' },
      { city_id: 'KAH', city_name: 'Kahramanmaraş' },
      { city_id: 'KRB', city_name: 'Karabük' },
      { city_id: 'KRM', city_name: 'Karaman' },
      { city_id: 'KRS', city_name: 'Kars' },
      { city_id: 'KAS', city_name: 'Kastamonu' },
      { city_id: 'KAY', city_name: 'Kayseri' },
      { city_id: 'KIL', city_name: 'Kilis' },
      { city_id: 'KIR', city_name: 'Kırıkkale' },
      { city_id: 'KRI', city_name: 'Kırklareli' },
      { city_id: 'KIRK', city_name: 'Kırşehir' },
      { city_id: 'KOC', city_name: 'Kocaeli' },
      { city_id: 'KON', city_name: 'Konya' },
      { city_id: 'KUT', city_name: 'Kütahya' },
      { city_id: 'MAL', city_name: 'Malatya' },
      { city_id: 'MAN', city_name: 'Manisa' },
      { city_id: 'MAR', city_name: 'Mardin' },
      { city_id: 'MER', city_name: 'Mersin' },
      { city_id: 'MUG', city_name: 'Muğla' },
      { city_id: 'MUS', city_name: 'Muş' },
      { city_id: 'NEV', city_name: 'Nevşehir' },
      { city_id: 'NIG', city_name: 'Niğde' },
      { city_id: 'ORD', city_name: 'Ordu' },
      { city_id: 'OSM', city_name: 'Osmaniye' },
      { city_id: 'RIZ', city_name: 'Rize' },
      { city_id: 'SAK', city_name: 'Sakarya' },
      { city_id: 'SAM', city_name: 'Samsun' },
      { city_id: 'SIR', city_name: 'Siirt' },
      { city_id: 'SIN', city_name: 'Sinop' },
      { city_id: 'SIV', city_name: 'Sivas' },
      { city_id: 'SAN', city_name: 'Şanlıurfa' },
      { city_id: 'SIRN', city_name: 'Şırnak' },
      { city_id: 'TEK', city_name: 'Tekirdağ' },
      { city_id: 'TOK', city_name: 'Tokat' },
      { city_id: 'TRA', city_name: 'Trabzon' },
      { city_id: 'TUN', city_name: 'Tunceli' },
      { city_id: 'USK', city_name: 'Uşak' },
      { city_id: 'VAN', city_name: 'Van' },
      { city_id: 'YOZ', city_name: 'Yozgat' },
      { city_id: 'ZON', city_name: 'Zonguldak' }
    ];
    

    for (const city of cities) {
      const cityExists = await City.findOne({ city_id: city.city_id });
      if (!cityExists) {
        await City.create(city);
        console.log(`City ${city.city_name} created`);
      }
    }

    console.log('Initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
};

initializeData(); 