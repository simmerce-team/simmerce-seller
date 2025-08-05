'use server';

import { createClient } from '@/utils/supabase/server';

export async function signUp(formData: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  businessName: string;
  businessTypeId: string;
  gstNumber?: string;
  address: string;
  city: string;
  cityId?: string;
  state: string;
  stateId?: string;
  pincode: string;
}) {
  const supabase = await createClient();

  try {
    // 1. Sign up the user
    let user = null;
    let session = null;
    
    // First try to sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone: formData.phone || null,
          business_name: formData.businessName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      },
    });

    if (signUpError) {
      // If user already exists, try to sign in
      if (signUpError.message.includes('already registered')) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (signInError) {
          throw signInError;
        }
        
        // Use the signed-in user data
        user = signInData.user;
        session = signInData.session;
      } else {
        throw signUpError;
      }
    } else if (signUpData?.user) {
      // Use the signed-up user data
      user = signUpData.user;
      session = signUpData.session;
    }

    if (!user) {
      throw new Error('User creation failed: No user data returned');
    }
    
    // Ensure we have a valid session
    if (!session) {
      // Try to get the session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        throw new Error('Failed to establish user session');
      }
      session = sessionData.session;
    }
    
    // 2. Create user profile in public.users
    const { error: userProfileError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
        created_at: new Date().toISOString()
      });
      
    if (userProfileError) {
      console.error('Error creating user profile:', userProfileError);
      
      // If we fail to create the user profile, try to delete the auth user
      if (user?.id) {
        await supabase.auth.admin.deleteUser(user.id);
      }
      
      throw new Error('Failed to create user profile');
    }

    // 2. Check if city exists, if not create it
    let cityId: string;
    
    // First try to get the existing city
    const { data: existingCity, error: cityLookupError } = await supabase
      .from('cities')
      .select('id')
      .eq('name', formData.city)
      .eq('state_id', formData.stateId)
      .single();
    
    if (cityLookupError && cityLookupError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error looking up city:', cityLookupError);
      throw cityLookupError;
    }
    
    if (existingCity) {
      cityId = existingCity.id;
    } else {
      // City doesn't exist, create it
      // First, get or create the state
      const { data: existingState, error: stateLookupError } = await supabase
        .from('states')
        .select('id')
        .eq('name', formData.state)
        .single();
        
      let stateId = formData.stateId;
      
      if (!existingState && !stateId) {
        // If state doesn't exist, you might want to handle this case
        // For now, we'll just use the first state as a fallback
        const { data: firstState } = await supabase
          .from('states')
          .select('id')
          .limit(1)
          .single();
          
        if (firstState) {
          stateId = firstState.id;
        } else {
          throw new Error('No states available in the database');
        }
      } else if (existingState) {
        stateId = existingState.id;
      }
      
      const { data: newCity, error: cityCreateError } = await supabase
        .from('cities')
        .insert({
          name: formData.city,
          state_id: stateId,
          country_id: '1' // You might want to make this dynamic or configurable
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
        pincode: formData.pincode,
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
        user_id: user.id,
        business_id: businessData.id,
        role: 'owner',
      });

    if (userBusinessError) {
      throw userBusinessError;
    }

    return { 
      success: true, 
      userId: user.id,
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
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    // Get additional user data from the public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (userError) {
      console.error('Error fetching user data:', userError);
      return null;
    }
    
    // Merge all user data
    return {
      ...user,
      user_metadata: {
        ...user.user_metadata,
        ...userData,
      },
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

export interface BusinessType {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export async function getBusinessTypes(): Promise<BusinessType[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('business_types')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching business types:', error);
    throw error;
  }

  return data as BusinessType[];
}

export async function getBusinessTypesAction(): Promise<BusinessType[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('business_types')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching business types:', error);
    throw error;
  }

  return data as BusinessType[];
}

export interface State {
  id: string;
  name: string;
  country_id: string;
}

export async function getStates(): Promise<State[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('states')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching states:', error);
    throw error;
  }

  return data as State[];
}

export interface City {
  id: string;
  name: string;
  state_id: string;
}

export async function getCitiesByState(stateId: string): Promise<City[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('state_id', stateId)
    .order('name', { ascending: true });

  if (error) {
    console.error(`Error fetching cities for state ${stateId}:`, error);
    throw error;
  }

  return data as City[];
}

export async function addNewCity(name: string, stateId: string, countryId: string): Promise<City> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('cities')
    .insert([
      { 
        name,
        state_id: stateId,
        country_id: countryId 
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding new city:', error);
    throw error;
  }

  return data as City;
}

export async function getCurrentUserAction() {
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
