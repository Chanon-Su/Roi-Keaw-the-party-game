export type Card_type = {
  id: string;
  title: string;
  description_Eng: string;
  description_Thai: string;
  maxCopies: number;
  enabled:boolean;
};

       
export type Deck_type = {
  id: string;
  name: string;
  cards: Card_type[];
};
