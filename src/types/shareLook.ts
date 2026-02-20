import { EquippedItems } from './rewards';

export interface SharedLook {
  id: string;
  player_name: string;
  character_id: string;
  equipped_items: EquippedItems;
  share_code: string;
  likes_count: number;
  views_count: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShareLookPayload {
  player_name: string;
  character_id: string;
  equipped_items: EquippedItems;
}

export interface SocialSharePlatform {
  name: string;
  icon: React.ReactNode;
  color: string;
  shareUrl: (url: string, text: string) => string;
}
