import { MenuCategory } from './types';

export const MOCK_MENU: MenuCategory[] = [
  {
    title: { en: 'Starters', ur: 'Shuruat' },
    items: [
      {
        id: 's1',
        name: 'Crispy Finger Chips',
        description: {
          en: 'Golden crispy potato fingers served with tangy dip.',
          ur: 'Maze-dar karari chips chatpati chutney ke saath.',
        },
        price: 'Rs. 350',
        prepTime: '10-15 min',
        calories: 320,
        isBestseller: true,
        spiceLevel: 1,
      },
      {
        id: 's2',
        name: 'Vegetable Samosa',
        description: {
          en: 'Traditional pastry filled with spiced potatoes and peas.',
          ur: 'Aloo aur matar walay lazeez samosay.',
        },
        price: 'Rs. 150',
        prepTime: '8-12 min',
        calories: 210,
        isBestseller: false,
        spiceLevel: 2,
      },
    ],
  },
  {
    title: { en: 'Mains', ur: 'Khaas Pakwan' },
    items: [
      {
        id: 'm1',
        name: 'Chicken Karahi',
        description: {
          en: 'Wok-cooked chicken in a rich tomato and ginger gravy.',
          ur: 'Tamatar aur adrak se bani lazeez murgh karahi.',
        },
        price: 'Rs. 1,200',
        prepTime: '25-30 min',
        calories: 650,
        isBestseller: true,
        spiceLevel: 3,
      },
      {
        id: 'm2',
        name: 'Beef Nihari',
        description: {
          en: 'Slow-cooked beef stew with a thick spicy gravy.',
          ur: 'Aahista paka hua gaey ka gosht aur garha masala.',
        },
        price: 'Rs. 1,450',
        prepTime: '30-35 min',
        calories: 720,
        isBestseller: false,
        spiceLevel: 3,
      },
      {
        id: 'm3',
        name: 'Vegetable Biryani',
        description: {
          en: 'Fragrant basmati rice cooked with seasonal vegetables and spices.',
          ur: 'Khushbudar chawal seasonal sabziyon ke saath.',
        },
        price: 'Rs. 750',
        prepTime: '20-25 min',
        calories: 480,
        isBestseller: false,
        spiceLevel: 2,
      },
    ],
  },
  {
    title: { en: 'Drinks', ur: 'Mashruubat' },
    items: [
      {
        id: 'd1',
        name: 'Fresh Lime Soda',
        description: {
          en: 'Refreshing lime juice with sparkling soda.',
          ur: 'Taza lemu ka ras aur thanda soda.',
        },
        price: 'Rs. 250',
        prepTime: '5-8 min',
        calories: 80,
        isBestseller: true,
        spiceLevel: 1,
      },
      {
        id: 'd2',
        name: 'Masala Chai',
        description: {
          en: 'Traditional Pakistani spiced tea with fresh milk.',
          ur: 'Doodh patti aur masalon wali Pakistani chai.',
        },
        price: 'Rs. 120',
        prepTime: '5-10 min',
        calories: 90,
        isBestseller: false,
        spiceLevel: 1,
      },
    ],
  },
];
