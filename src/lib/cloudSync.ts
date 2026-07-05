import { collection, getDocs, doc, writeBatch, query } from 'firebase/firestore'
import { db } from './firebase'

export async function wipeCloudData(uid: string) {
  if (uid.startsWith('guest-')) return;
  
  try {
    const collections = ['income', 'schedule', 'gym', 'savings'];
    const batch = writeBatch(db);
    
    for (const coll of collections) {
      const q = query(collection(db, 'users', uid, coll));
      const snap = await getDocs(q);
      snap.forEach(d => {
        batch.delete(d.ref);
      });
    }
    
    await batch.commit();
  } catch (error) {
    console.error('Failed to wipe cloud data:', error);
    throw error;
  }
}

export async function restoreBackupToCloud(uid: string, backupData: any) {
  if (uid.startsWith('guest-')) return;

  try {
    await wipeCloudData(uid);
    const batch = writeBatch(db);

    const processStore = (storeKey: string, collName: string, itemsKey: string) => {
      if (backupData[storeKey]) {
        try {
          const parsed = typeof backupData[storeKey] === 'string' 
            ? JSON.parse(backupData[storeKey]) 
            : backupData[storeKey];
            
          const items = parsed?.state?.[itemsKey] || [];
          items.forEach((item: any) => {
            if (item.id) {
              batch.set(doc(db, 'users', uid, collName, item.id), item);
            }
          });
        } catch (e) {
          console.error(`Failed to parse ${storeKey}:`, e);
        }
      }
    };

    processStore('farid-income-store', 'income', 'entries');
    processStore('farid-schedule-store', 'schedule', 'tasks');
    processStore('farid-gym-store', 'gym', 'sessions');
    processStore('farid-savings-store', 'savings', 'entries');

    await batch.commit();
  } catch (error) {
    console.error('Failed to restore cloud data:', error);
    throw error;
  }
}
