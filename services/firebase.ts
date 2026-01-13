import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc,
  serverTimestamp,
  updateDoc,
  where,
  increment,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
// 타입 정의 파일이 있다면 이 줄을 유지하세요. 만약 에러나면 이 줄만 지우셔도 됩니다.
import { GuestbookEntry, ContentItem, Comment } from '../types';

// 1. 님의 진짜 파이어베이스 비밀 열쇠를 넣었습니다.
const firebaseConfig = {
  apiKey: "AIzaSyAIhldYrJQlT0ME1uWXoozADdHN72dmlO8",
  authDomain: "yoon-2007.firebaseapp.com",
  projectId: "yoon-2007",
  storageBucket: "yoon-2007.firebasestorage.app",
  messagingSenderId: "101769158544",
  appId: "1:101769158544:web:1f49aa66afd430302b9d15",
  measurementId: "G-1F2JXYV214"
};

// 2. 파이어베이스 시작
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- 3. 여기서부터는 웹사이트가 작동하는 데 필요한 기능들입니다 (지우면 안됨!) ---

// 관리자 로그인 기능
export const loginAdmin = async (email: string, pass: string) => {
  return signInWithEmailAndPassword(auth, email, pass);
};

// 로그아웃 기능
export const logoutAdmin = async () => {
  return signOut(auth);
};

// 로그인 상태 감시 (누가 로그인했나 확인)
export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// --- 방명록 관련 기능 ---
export const addGuestbookEntry = async (name: string, content: string) => {
  await addDoc(collection(db, 'guestbook'), {
    name,
    content,
    createdAt: Date.now() // 정렬을 위한 시간 저장
  });
};

export const deleteGuestbookEntry = async (id: string) => {
  await deleteDoc(doc(db, 'guestbook', id));
};

export const subscribeToGuestbook = (callback: (entries: GuestbookEntry[]) => void) => {
  const q = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GuestbookEntry));
    callback(entries);
  });
};

// --- 블로그/메모 관련 기능 ---
export const addContentItem = async (item: Omit<ContentItem, 'id'>) => {
  await addDoc(collection(db, 'contents'), item);
};

export const deleteContentItem = async (id: string) => {
  await deleteDoc(doc(db, 'contents', id));
};

// 핀(상단고정) 토글 기능 - 하나만 고정되도록 처리
export const toggleContentPin = async (id: string, category: string, currentStatus: boolean) => {
  const batch = writeBatch(db);

  // 1. 이미 핀이 되어있던 거라면 -> 핀 해제만 수행
  if (currentStatus) {
    const docRef = doc(db, 'contents', id);
    batch.update(docRef, { isPinned: false });
  } 
  // 2. 핀이 안 되어있던 거라면 -> 다른 모든 핀 해제 후 이것만 핀 설정
  else {
    // 해당 카테고리에서 이미 핀 된 항목들 찾기
    const q = query(
      collection(db, 'contents'), 
      where('category', '==', category),
      where('isPinned', '==', true)
    );
    const snapshot = await getDocs(q);
    
    // 기존 핀들 모두 해제
    snapshot.forEach((doc) => {
      batch.update(doc.ref, { isPinned: false });
    });

    // 현재 선택한 항목 핀 설정
    const docRef = doc(db, 'contents', id);
    batch.update(docRef, { isPinned: true });
  }

  await batch.commit();
};

export const subscribeToContent = (category: string, callback: (items: ContentItem[]) => void) => {
  const q = query(collection(db, 'contents'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    let items = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as ContentItem))
      .filter(item => item.category === category);
    
    // 클라이언트 측 정렬: 핀 된 것을 최상단으로
    items.sort((a, b) => {
      // 둘 다 핀 상태가 같으면 최신순
      if (!!a.isPinned === !!b.isPinned) {
        return b.createdAt - a.createdAt;
      }
      // 핀 된게(true) 앞으로(-1)
      return a.isPinned ? -1 : 1;
    });

    callback(items);
  });
};

// --- 댓글(Comments) 관련 기능 ---
export const addComment = async (postId: string, name: string, content: string) => {
  const batch = writeBatch(db);
  const commentRef = doc(collection(db, 'comments'));
  
  // 1. 댓글 추가
  batch.set(commentRef, {
    postId,
    name,
    content,
    createdAt: Date.now()
  });

  // 2. 게시글의 댓글 수 증가
  const postRef = doc(db, 'contents', postId);
  batch.update(postRef, { commentCount: increment(1) });

  await batch.commit();
};

export const deleteComment = async (id: string, postId: string) => {
  const batch = writeBatch(db);
  
  // 1. 댓글 삭제
  batch.delete(doc(db, 'comments', id));

  // 2. 게시글의 댓글 수 감소
  const postRef = doc(db, 'contents', postId);
  batch.update(postRef, { commentCount: increment(-1) });

  await batch.commit();
};

export const subscribeToComments = (postId: string, callback: (comments: Comment[]) => void) => {
  // 수정됨: orderBy를 제거하여 복합 인덱스 오류 방지 (클라이언트 측에서 정렬 수행)
  const q = query(
    collection(db, 'comments'), 
    where('postId', '==', postId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Comment));
    
    // 가져온 후 여기서 날짜순 정렬 (오래된 댓글이 위로)
    comments.sort((a, b) => a.createdAt - b.createdAt);
    
    callback(comments);
  });
};