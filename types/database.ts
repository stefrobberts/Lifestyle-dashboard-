export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      daily_task_definitions: {
        Row: {
          anchor_date: string
          category: string
          created_at: string
          every_x_days: number | null
          frequency_type: string
          id: string
          is_active: boolean
          reminder_time: string | null
          sort_order: number
          specific_days: number[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          anchor_date?: string
          category: string
          created_at?: string
          every_x_days?: number | null
          frequency_type: string
          id?: string
          is_active?: boolean
          reminder_time?: string | null
          sort_order?: number
          specific_days?: number[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          anchor_date?: string
          category?: string
          created_at?: string
          every_x_days?: number | null
          frequency_type?: string
          id?: string
          is_active?: boolean
          reminder_time?: string | null
          sort_order?: number
          specific_days?: number[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_task_logs: {
        Row: {
          completed_at: string
          completed_date: string
          created_at: string
          id: string
          task_definition_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          completed_date: string
          created_at?: string
          id?: string
          task_definition_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          completed_date?: string
          created_at?: string
          id?: string
          task_definition_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_task_logs_task_definition_id_fkey"
            columns: ["task_definition_id"]
            isOneToOne: false
            referencedRelation: "daily_task_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_card_prefs: {
        Row: {
          card_key: string
          created_at: string
          id: string
          is_visible: boolean
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          card_key: string
          created_at?: string
          id?: string
          is_visible?: boolean
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          card_key?: string
          created_at?: string
          id?: string
          is_visible?: boolean
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      food_diary_entries: {
        Row: {
          calories: number
          carbs_g: number
          created_at: string
          entry_date: string
          fat_g: number
          id: string
          logged_at: string
          meal_type: string
          product_id: string | null
          protein_g: number
          quantity_g: number | null
          recipe_id: string | null
          servings: number | null
          source_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calories: number
          carbs_g: number
          created_at?: string
          entry_date: string
          fat_g: number
          id?: string
          logged_at?: string
          meal_type: string
          product_id?: string | null
          protein_g: number
          quantity_g?: number | null
          recipe_id?: string | null
          servings?: number | null
          source_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calories?: number
          carbs_g?: number
          created_at?: string
          entry_date?: string
          fat_g?: number
          id?: string
          logged_at?: string
          meal_type?: string
          product_id?: string | null
          protein_g?: number
          quantity_g?: number | null
          recipe_id?: string | null
          servings?: number | null
          source_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_diary_entries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_diary_entries_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      inbox_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          is_processed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_processed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_processed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          brand: string | null
          calories_per_100g: number
          carbs_per_100g: number
          created_at: string
          default_portion_g: number | null
          fat_per_100g: number
          id: string
          is_favorite: boolean
          name: string
          off_barcode: string | null
          protein_per_100g: number
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          calories_per_100g: number
          carbs_per_100g: number
          created_at?: string
          default_portion_g?: number | null
          fat_per_100g: number
          id?: string
          is_favorite?: boolean
          name: string
          off_barcode?: string | null
          protein_per_100g: number
          source: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          calories_per_100g?: number
          carbs_per_100g?: number
          created_at?: string
          default_portion_g?: number | null
          fat_per_100g?: number
          id?: string
          is_favorite?: boolean
          name?: string
          off_barcode?: string | null
          protein_per_100g?: number
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity_g: number
          recipe_id: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity_g: number
          recipe_id: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity_g?: number
          recipe_id?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          created_at: string
          id: string
          instructions: string | null
          is_favorite: boolean
          photo_path: string | null
          servings: number
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          instructions?: string | null
          is_favorite?: boolean
          photo_path?: string | null
          servings?: number
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          instructions?: string | null
          is_favorite?: boolean
          photo_path?: string | null
          servings?: number
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          calorie_goal: number
          carbs_goal_g: number | null
          created_at: string
          fat_goal_g: number | null
          id: string
          protein_goal_g: number
          sample_recipes_seeded: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calorie_goal?: number
          carbs_goal_g?: number | null
          created_at?: string
          fat_goal_g?: number | null
          id?: string
          protein_goal_g?: number
          sample_recipes_seeded?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calorie_goal?: number
          carbs_goal_g?: number | null
          created_at?: string
          fat_goal_g?: number | null
          id?: string
          protein_goal_g?: number
          sample_recipes_seeded?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
