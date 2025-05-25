import { supabase } from './supabaseClient';

// Ottieni tutti gli annunci ordinati per data discendente
export async function getAnnouncements() {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Errore nel recupero annunci:', error);
    return [];
  }

  return data;
}

// Salva un nuovo annuncio
export async function saveAnnouncements(announcement) {
  const { data, error } = await supabase
    .from('announcements')
    .insert([announcement]);

  if (error) {
    console.error('Errore nel salvataggio annuncio:', error);
    throw error;
  }

  return data;
}
