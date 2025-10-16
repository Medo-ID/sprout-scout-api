export interface Garden {
  id: string;
  user_id: string;
  name: string;
  location: string | undefined;
  created_at: Date;
}
