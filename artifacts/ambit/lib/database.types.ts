export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Profile {
  id: string;
  email: string;
  nickname: string | null;
  username: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  avatar_style: string | null;
  ambition_title: string | null;
  focus_topics: string[];
  student_identity: string | null;
  circle_preference: string | null;
  xp: number;
  level: number;
  streak: number;
  role: "user" | "mod" | "admin";
  is_banned: boolean;
  is_premium: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string; email: string }; Update: Partial<Profile> };
      circles: { Row: { id: string; name: string; description: string | null; topic: string | null; icon_url: string | null; member_count: number; created_at: string }; Insert: any; Update: any };
      circle_members: { Row: { id: string; circle_id: string; user_id: string; joined_at: string }; Insert: any; Update: any };
      posts: { Row: { id: string; author_id: string; circle_id: string | null; content: string; image_url: string | null; post_type: string; like_count: number; comment_count: number; status: string; created_at: string }; Insert: any; Update: any };
      comments: { Row: { id: string; post_id: string; author_id: string; content: string; status: string; created_at: string }; Insert: any; Update: any };
      post_likes: { Row: { id: string; post_id: string; user_id: string; created_at: string }; Insert: any; Update: any };
      follows: { Row: { id: string; follower_id: string; following_id: string; created_at: string }; Insert: any; Update: any };
      goals: { Row: { id: string; user_id: string; title: string; description: string | null; type: string; progress: number; deadline: string | null; completed: boolean; created_at: string }; Insert: any; Update: any };
      badges: { Row: { id: string; name: string; description: string | null; icon: string; color: string; xp_required: number; created_at: string }; Insert: any; Update: any };
      user_badges: { Row: { id: string; user_id: string; badge_id: string; earned_at: string }; Insert: any; Update: any };
      reports: { Row: { id: string; reporter_id: string; reported_user_id: string | null; post_id: string | null; comment_id: string | null; reason: string; details: string | null; severity: string; status: string; created_at: string }; Insert: any; Update: any };
      notifications: { Row: { id: string; user_id: string; title: string; body: string | null; type: string; link: string | null; is_read: boolean; created_at: string }; Insert: any; Update: any };
      mentor_messages: { Row: { id: string; user_id: string; role: "user" | "assistant"; content: string; created_at: string }; Insert: any; Update: any };
    };
  };
}
