'use server';

import { createClient } from '@/utils/supabase/server';
import { getUniqueSlug } from './slugify';

export type State = {
  id: string;
  name: string;
  country_id: string;
};

export type City = {
  id: string;
  name: string;
  state_id: string;
};

export async function getStates(): Promise<State[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('states')
    .select('id, name, country_id')
    .order('name');

  if (error) {
    console.error('Error fetching states:', error);
    throw new Error('Failed to fetch states');
  }

  return data || [];
}

export async function getCitiesByState(stateId: string): Promise<City[]> {
  if (!stateId) return [];
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('cities')
    .select('id, name, state_id')
    .eq('state_id', stateId)
    .order('name');

  if (error) {
    console.error('Error fetching cities:', error);
    throw new Error('Failed to fetch cities');
  }

  return data || [];
}

export async function addNewCity(name: string, stateId: string, countryId: string): Promise<City> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('cities')
    .insert([
      { 
        name,
        state_id: stateId,
        country_id: countryId,
        slug: await getUniqueSlug('cities', name),
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