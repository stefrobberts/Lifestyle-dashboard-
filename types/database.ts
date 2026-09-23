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
      body_measurements: {
        Row: {
          arm_cm: number | null
          body_fat_percentage: number | null
          chest_cm: number | null
          created_at: string
          hips_cm: number | null
          id: string
          measured_at: string
          notes: string | null
          updated_at: string
          user_id: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          arm_cm?: number | null
          body_fat_percentage?: number | null
          chest_cm?: number | null
          created_at?: string
          hips_cm?: number | null
          id?: string
          measured_at: string
          notes?: string | null
          updated_at?: string
          user_id: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          arm_cm?: number | null
          body_fat_percentage?: number | null
          chest_cm?: number | null
          created_at?: string
          hips_cm?: number | null
          id?: string
          measured_at?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
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
      exercises: {
        Row: {
          created_at: string
          id: string
          muscle_group: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          muscle_group: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          muscle_group?: string
          name?: string
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
      linkedin_ideas: {
        Row: {
          body: string | null
          created_at: string
          hook: string | null
          id: string
          image_path: string | null
          planned_date: string | null
          status: string
          subject: string
          tags: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          hook?: string | null
          id?: string
          image_path?: string | null
          planned_date?: string | null
          status?: string
          subject: string
          tags?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          hook?: string | null
          id?: string
          image_path?: string | null
          planned_date?: string | null
          status?: string
          subject?: string
          tags?: string[]
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
      progress_photos: {
        Row: {
          created_at: string
          id: string
          photo_path: string
          taken_at: string
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          photo_path: string
          taken_at: string
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          photo_path?: string
          taken_at?: string
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
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
      schedule_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          schedule_id: string
          sort_order: number
          target_reps: string
          target_sets: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          schedule_id: string
          sort_order?: number
          target_reps: string
          target_sets: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          schedule_id?: string
          sort_order?: number
          target_reps?: string
          target_sets?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_exercises_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "workout_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          calorie_goal: number
          carbs_goal_g: number | null
          created_at: string
          fat_goal_g: number | null
          id: string
          protein_goal_g: number
          sample_measurements_seeded: boolean
          sample_recipes_seeded: boolean
          sample_sport_seeded: boolean
          sample_work_seeded: boolean
          theme: string
          updated_at: string
          user_id: string
          work_categories_seeded: boolean
        }
        Insert: {
          calorie_goal?: number
          carbs_goal_g?: number | null
          created_at?: string
          fat_goal_g?: number | null
          id?: string
          protein_goal_g?: number
          sample_measurements_seeded?: boolean
          sample_recipes_seeded?: boolean
          sample_sport_seeded?: boolean
          sample_work_seeded?: boolean
          theme?: string
          updated_at?: string
          user_id: string
          work_categories_seeded?: boolean
        }
        Update: {
          calorie_goal?: number
          carbs_goal_g?: number | null
          created_at?: string
          fat_goal_g?: number | null
          id?: string
          protein_goal_g?: number
          sample_measurements_seeded?: boolean
          sample_recipes_seeded?: boolean
          sample_sport_seeded?: boolean
          sample_work_seeded?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
          work_categories_seeded?: boolean
        }
        Relationships: []
      }
      work_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      work_notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      work_tasks: {
        Row: {
          category_id: string | null
          completed_at: string | null
          created_at: string
          deadline: string | null
          id: string
          notes: string | null
          parent_task_id: string | null
          priority: string
          recurrence_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          notes?: string | null
          parent_task_id?: string | null
          priority?: string
          recurrence_type?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          notes?: string | null
          parent_task_id?: string | null
          priority?: string
          recurrence_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_tasks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "work_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "work_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_schedules: {
        Row: {
          created_at: string
          id: string
          sort_order: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          schedule_id: string | null
          started_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          schedule_id?: string | null
          started_at?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          schedule_id?: string | null
          started_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "workout_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sets: {
        Row: {
          completed_at: string
          created_at: string
          exercise_id: string
          id: string
          reps: number
          session_id: string
          set_number: number
          updated_at: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          completed_at?: string
          created_at?: string
          exercise_id: string
          id?: string
          reps: number
          session_id: string
          set_number: number
          updated_at?: string
          user_id: string
          weight_kg: number
        }
        Update: {
          completed_at?: string
          created_at?: string
          exercise_id?: string
          id?: string
          reps?: number
          session_id?: string
          set_number?: number
          updated_at?: string
          user_id?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
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
