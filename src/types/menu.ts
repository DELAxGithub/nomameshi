export interface Dish {
  originalName: string;
  translatedName: string;
  description: string;
  price?: string | null;
  imageQuery: string;
}

export interface Section {
  originalTitle: string;
  translatedTitle: string;
  dishes: Dish[];
}

export interface MenuResult {
  restaurantName?: string | null;
  restaurantVibe?: string;
  language?: string;
  sections: Section[];
}

export interface SavedMenu {
  id: string;
  savedAt: number;
  regionCode: string;
  targetLang: string;
  menu: MenuResult;
}
