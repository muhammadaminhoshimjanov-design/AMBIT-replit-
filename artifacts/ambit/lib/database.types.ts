export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          nickname: string | null;
          bio: string | null;
          avatar_url: string | null;
          avatar_style: string | null;
          focus_topics: string[];
          student_identity: string | null;
          circle_preference: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nickname?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          avatar_style?: string | null;
          focus_topics?: string[];
          student_identity?: string | null;
          circle_preference?: string | null;
          onboarding_completed?: boolean;
        };
        Update: {
          nickname?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          avatar_style?: string | null;
          focus_topics?: string[];
          student_identity?: string | null;
          circle_preference?: string | null;
          onboarding_completed?: boolean;
          updated_at?: string;
        };
      };
      circles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          member_count: number;
          topic: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          topic?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          member_count?: number;
          topic?: string | null;
        };
      };
      circle_members: {
        Row: {
          id: string;
          circle_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          circle_id: string;
          user_id: string;
        };
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          circle_id: string | null;
          content: string;
          post_type: "question" | "debate" | "experience" | "general";
          like_count: number;
          comment_count: number;
          created_at: string;
        };
        Insert: {
          author_id: string;
          circle_id?: string | null;
          content: string;
          post_type?: "question" | "debate" | "experience" | "general";
        };
        Update: {
          like_count?: number;
          comment_count?: number;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          author_id: string;
          content: string;
        };
      };
      post_likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
        };
      };
    };
  };
}
