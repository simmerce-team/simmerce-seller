"use server";

import { createClient } from "@/utils/supabase/server";



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

// New: Partial update for business-only fields
export async function updateBusinessProfile(input: {
  businessName: string;
  businessType: string;
  gstNumber?: string;
}) {
  const supabase = await createClient();
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("User not authenticated");

    const { data: userBusiness, error: userBusinessError } = await supabase
      .from("user_businesses")
      .select("business_id")
      .eq("user_id", user.id)
      .single();

    if (userBusinessError || !userBusiness?.business_id) {
      throw new Error("User is not associated with any business");
    }

    const { data: business, error } = await supabase
      .from("businesses")
      .update({
        name: input.businessName,
        business_type_id: input.businessType,
        gst_number: input.gstNumber || null,
      })
      .eq("id", userBusiness.business_id)
      .select("*")
      .single();

    if (error) throw error;

    return { success: true, data: business };
  } catch (error) {
    console.error("updateBusinessProfile error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update business profile",
    };
  }
}

// New: Partial update for contact-related fields (user + business address)
export async function updateContactInfo(input: {
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
    if (authError || !user) throw new Error("User not authenticated");

    const { error: userUpdateError } = await supabase
      .from("users")
      .update({
        full_name: input.fullName,
        phone: input.phone,
        email: input.email,
      })
      .eq("id", user.id);

    if (userUpdateError) throw userUpdateError;

    const { data: userBusiness, error: userBusinessError } = await supabase
      .from("user_businesses")
      .select("business_id")
      .eq("user_id", user.id)
      .single();

    if (userBusinessError || !userBusiness?.business_id) {
      throw new Error("User is not associated with any business");
    }

    const { data: business, error } = await supabase
      .from("businesses")
      .update({
        address: input.address,
        pincode: input.pincode,
        city_id: input.city,
        state_id: input.state,
      })
      .eq("id", userBusiness.business_id)
      .select("*")
      .single();

    if (error) throw error;

    return { success: true, data: { business } };
  } catch (error) {
    console.error("updateContactInfo error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update contact info",
    };
  }
}
