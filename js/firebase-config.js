// Firebase Firestore 설정 (K-COLUMN 공정관리용)
// 프로젝트: hakdong-a80b8

const firebaseConfig = {
  apiKey: "AIzaSyDIuTX7eQVscRl5GJxtKVWHeF7MCfCbFPc",
  authDomain: "hakdong-a80b8.firebaseapp.com",
  projectId: "hakdong-a80b8",
  storageBucket: "hakdong-a80b8.firebasestorage.app",
  messagingSenderId: "578179103785",
  appId: "1:578179103785:web:b8daecb0ac24924e30b038",
  measurementId: "G-E5G02CLNQK"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Firestore 인스턴스
const db = firebase.firestore();

// ============================================================
// Firestore 헬퍼 함수
// ============================================================
const FirestoreDB = {
  
  // 문서 추가 (자동 ID 생성)
  async add(collection, data) {
    try {
      const docRef = await db.collection(collection).add({
        ...data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('[Firestore] 문서 추가됨:', collection, docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('[Firestore] 추가 오류:', error);
      throw error;
    }
  },

  // 문서 추가 (ID 지정)
  async set(collection, docId, data) {
    try {
      await db.collection(collection).doc(docId).set({
        ...data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('[Firestore] 문서 설정됨:', collection, docId);
      return docId;
    } catch (error) {
      console.error('[Firestore] 설정 오류:', error);
      throw error;
    }
  },

  // 단일 문서 조회
  async get(collection, docId) {
    try {
      const doc = await db.collection(collection).doc(docId).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('[Firestore] 조회 오류:', error);
      throw error;
    }
  },

  // 컬렉션 전체 조회
  async getAll(collection, orderByField = 'createdAt', direction = 'desc') {
    try {
      const snapshot = await db.collection(collection)
        .orderBy(orderByField, direction)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('[Firestore] 전체 조회 오류:', error);
      throw error;
    }
  },

  // 조건부 조회
  async query(collection, field, operator, value) {
    try {
      const snapshot = await db.collection(collection)
        .where(field, operator, value)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('[Firestore] 쿼리 오류:', error);
      throw error;
    }
  },

  // 문서 업데이트
  async update(collection, docId, data) {
    try {
      await db.collection(collection).doc(docId).update({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('[Firestore] 문서 업데이트됨:', collection, docId);
    } catch (error) {
      console.error('[Firestore] 업데이트 오류:', error);
      throw error;
    }
  },

  // 문서 삭제
  async delete(collection, docId) {
    try {
      await db.collection(collection).doc(docId).delete();
      console.log('[Firestore] 문서 삭제됨:', collection, docId);
    } catch (error) {
      console.error('[Firestore] 삭제 오류:', error);
      throw error;
    }
  },

  // 실시간 리스너 (컬렉션)
  onSnapshot(collection, callback, orderByField = 'createdAt', direction = 'desc') {
    return db.collection(collection)
      .orderBy(orderByField, direction)
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
      }, error => {
        console.error('[Firestore] 실시간 리스너 오류:', error);
      });
  },

  // 실시간 리스너 (단일 문서)
  onDocSnapshot(collection, docId, callback) {
    return db.collection(collection).doc(docId).onSnapshot(doc => {
      if (doc.exists) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    }, error => {
      console.error('[Firestore] 문서 리스너 오류:', error);
    });
  },

  // 배치 쓰기 (여러 문서 한번에)
  async batchWrite(operations) {
    const batch = db.batch();
    
    operations.forEach(op => {
      const ref = db.collection(op.collection).doc(op.docId || db.collection(op.collection).doc().id);
      if (op.type === 'set') {
        batch.set(ref, { ...op.data, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      } else if (op.type === 'update') {
        batch.update(ref, { ...op.data, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
      } else if (op.type === 'delete') {
        batch.delete(ref);
      }
    });

    try {
      await batch.commit();
      console.log('[Firestore] 배치 쓰기 완료:', operations.length, '건');
    } catch (error) {
      console.error('[Firestore] 배치 쓰기 오류:', error);
      throw error;
    }
  }
};

// ============================================================
// K-COLUMN 공정관리 전용 함수
// ============================================================
const KColumnDB = {
  
  // 일일 입력 저장
  async saveDailyInput(data) {
    return await FirestoreDB.add('daily_inputs', {
      date: data.date || new Date().toISOString().split('T')[0],
      project: data.project,
      process: data.process,
      quantity: data.quantity,
      worker: data.worker,
      notes: data.notes || '',
      userId: data.userId || null
    });
  },

  // 특정 날짜 일일 입력 조회
  async getDailyInputs(date) {
    return await FirestoreDB.query('daily_inputs', 'date', '==', date);
  },

  // 프로젝트별 일일 입력 조회
  async getDailyInputsByProject(project) {
    return await FirestoreDB.query('daily_inputs', 'project', '==', project);
  },

  // 공정 진행률 저장
  async saveProgress(data) {
    const docId = `${data.project}_${data.process}`.replace(/\s/g, '_');
    return await FirestoreDB.set('progress', docId, {
      project: data.project,
      process: data.process,
      completed: data.completed,
      total: data.total,
      percentage: Math.round((data.completed / data.total) * 100)
    });
  },

  // 프로젝트 전체 진행률 조회
  async getProjectProgress(project) {
    return await FirestoreDB.query('progress', 'project', '==', project);
  },

  // 실시간 일일 입력 리스너
  onDailyInputsChange(callback) {
    return FirestoreDB.onSnapshot('daily_inputs', callback, 'date', 'desc');
  },

  // 실시간 진행률 리스너
  onProgressChange(project, callback) {
    return db.collection('progress')
      .where('project', '==', project)
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
      });
  }
};

console.log('[Firebase] Firestore 초기화 완료 - 프로젝트:', firebaseConfig.projectId);
