'use server';

import { createClient } from '@/utils/supabase/server';

export async function signUp(formData: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  businessName: string;
  businessTypeId: string; // Changed from businessType to businessTypeId
  gstNumber?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}) {
  const supabase = await createClient();

  try {
    // Start a transaction
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone: formData.phone || null,
        },
      },
    });

    if (signUpError) {
      throw signUpError;
    }

    if (!authData.user) {
      throw new Error('User creation failed');
    }
    
    // 2. Create user profile in public.users
    const { error: userProfileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
        created_at: new Date().toISOString()
      });
      
    if (userProfileError) {
      console.error('Error creating user profile:', userProfileError);
      throw new Error('Failed to create user profile');
    }

    // 2. Check if city exists, if not create it
    let cityId: string;
    
    // First try to get the existing city
    const { data: existingCity, error: cityLookupError } = await supabase
      .from('cities')
      .select('id')
      .eq('name', formData.city)
      .eq('state', formData.state)
      .eq('pincode', formData.pincode)
      .single();
    
    if (cityLookupError && cityLookupError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error looking up city:', cityLookupError);
      throw cityLookupError;
    }
    
    if (existingCity) {
      cityId = existingCity.id;
    } else {
      // City doesn't exist, create it
      const { data: newCity, error: cityCreateError } = await supabase
        .from('cities')
        .insert({
          name: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: 'India'
        })
        .select('id')
        .single();
        
      if (cityCreateError) {
        console.error('Error creating city:', cityCreateError);
        throw cityCreateError;
      }
      
      cityId = newCity.id;
    }

    // 3. Verify business type exists
    const { data: businessType, error: businessTypeError } = await supabase
      .from('business_types')
      .select('id')
      .eq('id', formData.businessTypeId)
      .single();
      
    if (businessTypeError || !businessType) {
      console.error('Invalid business type:', businessTypeError);
      throw new Error('Invalid business type selected');
    }

    // 4. Create business
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .insert({
        name: formData.businessName,
        business_type_id: formData.businessTypeId,
        gst_number: formData.gstNumber || null,
        address: formData.address,
        city_id: cityId,
        is_verified: false,
      })
      .select('id')
      .single();

    if (businessError) {
      throw businessError;
    }

    // 4. Link user to business
    const { error: userBusinessError } = await supabase
      .from('user_businesses')
      .insert({
        user_id: authData.user.id,
        business_id: businessData.id,
        role: 'owner',
      });

    if (userBusinessError) {
      throw userBusinessError;
    }

    return { 
      success: true, 
      userId: authData.user.id,
      businessId: businessData.id 
    };

  } catch (error) {
    console.error('Signup error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An error occurred during signup' 
    };
  }
}

export async function login(email: string, password: string) {
  try {
    // Basic validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      // Handle specific error cases
      if (error.status === 400) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Incorrect email or password. Please try again.');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
        }
      }
      // For any other errors, include the original error message
      throw new Error(`Login failed: ${error.message}`);
    }

    if (!data.session || !data.user) {
      throw new Error('Login successful but no session was created. Please try again.');
    }

    // Get the user's business information
    const { data: userBusiness, error: userBusinessError } = await supabase
      .from('user_businesses')
      .select('business_id, role')
      .eq('user_id', data.user.id)
      .single();

    if (userBusinessError && userBusinessError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching user business:', userBusinessError);
      // Don't fail login if we can't get business info
    }

    return {
      success: true,
      userId: data.user.id,
      businessId: userBusiness?.business_id,
      role: userBusiness?.role,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred during login',
    };
  }
};

export async function checkEmailExists(email: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .single();
    
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error checking email:', error);
    return false;
  }
  
  return !!data;
}

export async function getUserByEmail(email: string) {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return { data: null, error: null };
      }
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch user' };
  }
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { data: null, error: error?.message || 'No user found' };
  }
  
  // Fetch additional user data if needed
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (userError) {
    console.error('Error fetching user data:', userError);
    return { data: { ...user, full_name: user.email?.split('@')[0] }, error: null };
  }
  
  return { 
    data: { 
      ...user, 
      full_name: userData?.full_name || user.email?.split('@')[0] || 'User',
      avatar_url: userData?.avatar_url
    }, 
    error: null 
  };
}
