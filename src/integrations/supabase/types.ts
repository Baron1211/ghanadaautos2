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
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          active: boolean
          created_at: string
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          item_type: string
          part_id: string | null
          quantity: number
          rental_days: number | null
          rental_id: string | null
          rental_start: string | null
          user_id: string
          variation_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_type: string
          part_id?: string | null
          quantity?: number
          rental_days?: number | null
          rental_id?: string | null
          rental_start?: string | null
          user_id: string
          variation_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          item_type?: string
          part_id?: string | null
          quantity?: number
          rental_days?: number | null
          rental_id?: string | null
          rental_start?: string | null
          user_id?: string
          variation_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variation_id_fkey"
            columns: ["variation_id"]
            isOneToOne: false
            referencedRelation: "part_variations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_type: string
          line_total: number
          name: string
          order_id: string
          part_id: string | null
          quantity: number
          rental_days: number | null
          rental_id: string | null
          rental_start: string | null
          unit_price: number
          variation_id: string | null
          variation_label: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_type: string
          line_total: number
          name: string
          order_id: string
          part_id?: string | null
          quantity?: number
          rental_days?: number | null
          rental_id?: string | null
          rental_start?: string | null
          unit_price: number
          variation_id?: string | null
          variation_label?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          item_type?: string
          line_total?: number
          name?: string
          order_id?: string
          part_id?: string | null
          quantity?: number
          rental_days?: number | null
          rental_id?: string | null
          rental_start?: string | null
          unit_price?: number
          variation_id?: string | null
          variation_label?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          guest_email: string | null
          guest_name: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_ref: string | null
          payment_status: string
          phone: string | null
          shipping_address: string | null
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_ref?: string | null
          payment_status?: string
          phone?: string | null
          shipping_address?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_ref?: string | null
          payment_status?: string
          phone?: string | null
          shipping_address?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      part_variations: {
        Row: {
          active: boolean
          attributes: Json
          created_at: string
          id: string
          image_url: string | null
          label: string
          part_id: string
          price: number
          sort_order: number
          stock: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          attributes?: Json
          created_at?: string
          id?: string
          image_url?: string | null
          label: string
          part_id: string
          price: number
          sort_order?: number
          stock?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          attributes?: Json
          created_at?: string
          id?: string
          image_url?: string | null
          label?: string
          part_id?: string
          price?: number
          sort_order?: number
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "part_variations_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
        ]
      }
      parts: {
        Row: {
          active: boolean
          brand: string | null
          brand_id: string | null
          category: string | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          images: Json
          low_stock_threshold: number
          name: string
          price: number
          stock: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          brand?: string | null
          brand_id?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          images?: Json
          low_stock_threshold?: number
          name: string
          price: number
          stock?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          brand?: string | null
          brand_id?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          images?: Json
          low_stock_threshold?: number
          name?: string
          price?: number
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parts_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rental_bookings: {
        Row: {
          booking_number: string
          created_at: string
          currency: string
          daily_rate: number
          days: number
          destination: string | null
          driver_daily_fee: number
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_ref: string | null
          payment_status: string
          pickup_date: string
          rental_id: string
          return_date: string
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
          with_driver: boolean
        }
        Insert: {
          booking_number?: string
          created_at?: string
          currency?: string
          daily_rate: number
          days: number
          destination?: string | null
          driver_daily_fee?: number
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_ref?: string | null
          payment_status?: string
          pickup_date: string
          rental_id: string
          return_date: string
          status?: string
          subtotal: number
          total: number
          updated_at?: string
          user_id?: string | null
          with_driver?: boolean
        }
        Update: {
          booking_number?: string
          created_at?: string
          currency?: string
          daily_rate?: number
          days?: number
          destination?: string | null
          driver_daily_fee?: number
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_ref?: string | null
          payment_status?: string
          pickup_date?: string
          rental_id?: string
          return_date?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
          with_driver?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "rental_bookings_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      rentals: {
        Row: {
          active: boolean
          created_at: string
          daily_rate: number
          description: string | null
          features: Json
          fuel: string | null
          id: string
          image_url: string | null
          images: Json
          name: string
          seats: number | null
          transmission: string | null
          updated_at: string
          vehicle_type: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          daily_rate: number
          description?: string | null
          features?: Json
          fuel?: string | null
          id?: string
          image_url?: string | null
          images?: Json
          name: string
          seats?: number | null
          transmission?: string | null
          updated_at?: string
          vehicle_type?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          daily_rate?: number
          description?: string | null
          features?: Json
          fuel?: string | null
          id?: string
          image_url?: string | null
          images?: Json
          name?: string
          seats?: number | null
          transmission?: string | null
          updated_at?: string
          vehicle_type?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_reservations: {
        Row: {
          created_at: string
          guest_email: string
          guest_name: string
          guest_phone: string
          id: string
          intent: string
          notes: string | null
          preferred_date: string | null
          reservation_number: string
          status: string
          updated_at: string
          user_id: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          guest_email: string
          guest_name: string
          guest_phone: string
          id?: string
          intent?: string
          notes?: string | null
          preferred_date?: string | null
          reservation_number?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string
          guest_email?: string
          guest_name?: string
          guest_phone?: string
          id?: string
          intent?: string
          notes?: string | null
          preferred_date?: string | null
          reservation_number?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_reservations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          active: boolean | null
          body_type: string | null
          brand: string | null
          color: string | null
          condition: string
          created_at: string
          description: string | null
          drivetrain: string | null
          engine: string | null
          featured: boolean | null
          features: Json | null
          finance_available: boolean | null
          fuel: string | null
          id: string
          image_url: string | null
          images: Json | null
          interior_color: string | null
          mileage_km: number | null
          model: string | null
          name: string
          package_options: Json
          price: number
          seats: number | null
          standard_equipment: Json
          stock_number: string | null
          technical_specs: Json
          transmission: string | null
          updated_at: string
          vin: string | null
          year: number | null
        }
        Insert: {
          active?: boolean | null
          body_type?: string | null
          brand?: string | null
          color?: string | null
          condition?: string
          created_at?: string
          description?: string | null
          drivetrain?: string | null
          engine?: string | null
          featured?: boolean | null
          features?: Json | null
          finance_available?: boolean | null
          fuel?: string | null
          id?: string
          image_url?: string | null
          images?: Json | null
          interior_color?: string | null
          mileage_km?: number | null
          model?: string | null
          name: string
          package_options?: Json
          price?: number
          seats?: number | null
          standard_equipment?: Json
          stock_number?: string | null
          technical_specs?: Json
          transmission?: string | null
          updated_at?: string
          vin?: string | null
          year?: number | null
        }
        Update: {
          active?: boolean | null
          body_type?: string | null
          brand?: string | null
          color?: string | null
          condition?: string
          created_at?: string
          description?: string | null
          drivetrain?: string | null
          engine?: string | null
          featured?: boolean | null
          features?: Json | null
          finance_available?: boolean | null
          fuel?: string | null
          id?: string
          image_url?: string | null
          images?: Json | null
          interior_color?: string | null
          mileage_km?: number | null
          model?: string | null
          name?: string
          package_options?: Json
          price?: number
          seats?: number | null
          standard_equipment?: Json
          stock_number?: string | null
          technical_specs?: Json
          transmission?: string | null
          updated_at?: string
          vin?: string | null
          year?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer"],
    },
  },
} as const
