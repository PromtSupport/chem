import { create } from 'zustand';
import { AppState, Topic, ReferenceItem, StudentResult } from './types';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

interface StoreState extends AppState {
  fetchState: () => Promise<void>;
  updateCatalog: (newCatalog: Topic[]) => Promise<void>;
  updateReferenceData: (newData: ReferenceItem[]) => Promise<void>;
  submitResult: (result: StudentResult) => Promise<void>;
}

const initialReferenceData: ReferenceItem[] = [
  { id: '1', name: 'Глюкоза', formula: 'C₆H₁₂O₆', description: 'Альдегидоспирт и важнейший моносахарид. Ключевой источник энергии в живых организмах. Окисляется с реакцией «серебряного зеркала».' },
  { id: '2', name: 'Сахароза', formula: 'C₁₂H₂₂O₁₁', description: 'Дисахарид, состоящий из остатков глюкозы и фруктозы. Известна как обычный пищевой сахар. Самый сладкий углевод в быту.' },
  { id: '3', name: 'Натуральный каучук', formula: '(C₅H₈)ₙ', description: 'Полимер изопрена, получаемый из сока гевеи бразильской. В процессе вулканизации серой превращается в прочную резину.' },
  { id: '4', name: 'Метанол', formula: 'CH₃OH', description: 'Сильнейший яд! Одноатомный спирт, вызывающий слепоту и летальный исход при употреблении даже в малых дозах.' },
  { id: '5', name: 'Глицерин', formula: 'C₃H₅(OH)₃', description: 'Трехатомный спирт с характерным сладким вкусом. Применяется в медицине, косметике и производстве динамита.' },
  { id: '6', name: 'Белки', formula: 'Биополимеры', description: 'Цепочки аминокислот, соединенных пептидными связями. Основа структуры и метаболизма любой живой клетки.' }
];

export const useStore = create<StoreState>((set, get) => ({
  catalog: [],
  referenceData: [],
  studentResults: [],
  
  fetchState: async () => {
    // Seed initial Reference Data if firestore collection is completely empty
    try {
      const refDocs = await getDocs(collection(db, 'reference'));
      if (refDocs.empty) {
        for (const item of initialReferenceData) {
          const { id, ...data } = item;
          await setDoc(doc(db, 'reference', String(id)), data);
        }
      }
    } catch (e) {
      console.error("Failed to seed reference data", e);
    }

    // Sync catalog
    onSnapshot(collection(db, 'catalog'), (snapshot) => {
      const catalog = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Topic[];
      set({ catalog });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'catalog');
    });

    // Sync reference
    onSnapshot(collection(db, 'reference'), (snapshot) => {
      const referenceData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ReferenceItem[];
      set({ referenceData });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reference');
    });

    // Sync results
    onSnapshot(collection(db, 'results'), (snapshot) => {
      const studentResults = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StudentResult[];
      set({ studentResults });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'results');
    });
  },

  updateCatalog: async (newCatalog: Topic[]) => {
    try {
      // Basic sync logic: find what to delete, what to update
      const current = get().catalog;
      
      const toDelete = current.filter(c => !newCatalog.find(n => n.id === c.id));
      for (const t of toDelete) {
        await deleteDoc(doc(db, 'catalog', String(t.id)));
      }

      for (const t of newCatalog) {
        // Exclude ID from document body
        const { id, ...data } = t;
        await setDoc(doc(db, 'catalog', String(id)), data);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'catalog');
    }
  },

  updateReferenceData: async (newData: ReferenceItem[]) => {
    try {
      const current = get().referenceData;
      
      const toDelete = current.filter(c => !newData.find(n => n.id === c.id));
      for (const t of toDelete) {
        await deleteDoc(doc(db, 'reference', String(t.id)));
      }

      for (const item of newData) {
        const { id, ...data } = item;
        await setDoc(doc(db, 'reference', String(id)), data);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'reference');
    }
  },

  submitResult: async (result: StudentResult) => {
    try {
      const { id, ...data } = result;
      await setDoc(doc(db, 'results', String(id)), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'results');
    }
  }
}));

