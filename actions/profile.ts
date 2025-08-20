"use server";

import { createClient } from "@/utils/supabase/server";

export async function updateProfile(formData: {
  businessName: string;
  businessType: string;
  gstNumber?: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    // Update user data (only fields that exist in users table)
    const { error: userUpdateError } = await supabase
      .from("users")
      .update({
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
      })
      .eq("id", user.id);

    if (userUpdateError) throw userUpdateError;

    // Update business profile
    const { data: userBusiness, error: userBusinessError } = await supabase
      .from("user_businesses")
      .select("business_id")
      .eq("user_id", user.id)
      .single();

    if (userBusinessError || !userBusiness?.business_id) {
      throw new Error("User is not associated with any business");
    }

    // Update business data
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .update({
        name: formData.businessName,
        business_type_id: formData.businessType,
        gst_number: formData.gstNumber || null,
        address: formData.address,
        pincode: formData.pincode,
        city_id: formData.city,
        state_id: formData.state,
      })
      .eq("id", userBusiness.business_id)
      .select("*")
      .single();

    if (businessError) throw businessError;

    return {
      success: true,
      data: {
        user: {
          ...user,
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
        },
        business,
      },
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

export async function getProfileData() {
  const supabase = await createClient();

  try {
    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Get user data
    const { data: userData, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user data:", profileError);
      throw new Error("Failed to fetch user data");
    }

    // Get user's business association
    const { data: userBusiness, error: userBusinessError } = await supabase
      .from("user_businesses")
      .select("business_id")
      .eq("user_id", user.id)
      .single();

    if (userBusinessError || !userBusiness?.business_id) {
      console.error(
        "User is not associated with any business:",
        userBusinessError
      );
      return {
        user: {
          ...user,
          ...userData,
        },
        business: null,
      };
    }

    // First, get the business data with basic info
    const { data: businessData, error: businessError } = await supabase
      .from("businesses")
      .select(
        `
        *,
        business_type:business_types(*),
        city: cities(id, name, state: states(id, name))
      `
      )
      .eq("id", userBusiness.business_id)
      .single();

    if (businessError) {
      console.error("Error fetching business data:", businessError);
      // Return user data even if business data fails
      return {
        user: {
          ...user,
          ...userData,
        },
        business: null,
      };
    }

    // Format the response with location data
    const formattedBusiness = {
      ...businessData,
      city: { id: businessData.city.id, name: businessData.city.name },
      state: {
        id: businessData.city.state.id,
        name: businessData.city.state.name,
      },
      pincode: businessData?.pincode || "",
      business_type: businessData?.business_type,
    };

    return {
      user: {
        ...user,
        ...userData,
      },
      business: formattedBusiness,
    };
  } catch (error) {
    console.error("Error in getProfileData:", error);
    throw error;
  }
}
