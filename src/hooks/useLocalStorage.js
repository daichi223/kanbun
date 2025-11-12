import { useState, useEffect } from 'react';

/**
 * ローカルストレージ用カスタムフック
 * Custom hook for localStorage management
 */
export function useLocalStorage(key, initialValue) {
  // 初期値を取得（ローカルストレージまたはデフォルト）
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return initialValue;
    }
  });

  // 値を更新してローカルストレージに保存
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}

/**
 * 自動保存用カスタムフック
 * Custom hook for auto-save functionality
 */
export function useAutoSave(key, value, delay = 2000) {
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, delay);

    return () => clearTimeout(handler);
  }, [key, value, delay]);
}

/**
 * ドキュメント一覧を管理するフック
 * Hook for managing document list
 */
export function useDocumentList() {
  const [documents, setDocuments] = useState(() => {
    try {
      const saved = window.localStorage.getItem('kanbun_documents');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading document list:', error);
      return [];
    }
  });

  // ドキュメント保存
  const saveDocument = (doc) => {
    try {
      const newDocs = [...documents];
      const existingIndex = newDocs.findIndex(d => d.id === doc.id);

      if (existingIndex >= 0) {
        newDocs[existingIndex] = doc;
      } else {
        newDocs.push(doc);
      }

      setDocuments(newDocs);
      window.localStorage.setItem('kanbun_documents', JSON.stringify(newDocs));
      window.localStorage.setItem(`kanbun_doc_${doc.id}`, JSON.stringify(doc));

      return { success: true };
    } catch (error) {
      console.error('Error saving document:', error);
      return { success: false, error: error.message };
    }
  };

  // ドキュメント読み込み
  const loadDocument = (id) => {
    try {
      const saved = window.localStorage.getItem(`kanbun_doc_${id}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading document:', error);
      return null;
    }
  };

  // ドキュメント削除
  const deleteDocument = (id) => {
    try {
      const newDocs = documents.filter(d => d.id !== id);
      setDocuments(newDocs);
      window.localStorage.setItem('kanbun_documents', JSON.stringify(newDocs));
      window.localStorage.removeItem(`kanbun_doc_${id}`);

      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    documents,
    saveDocument,
    loadDocument,
    deleteDocument
  };
}

/**
 * ストレージ使用量を取得
 * Get storage usage information
 */
export function getStorageInfo() {
  try {
    let totalSize = 0;
    for (let key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }

    // 概算（bytes → KB）
    const sizeKB = (totalSize / 1024).toFixed(2);
    const maxSizeKB = 5120; // 5MB（ブラウザの一般的な制限）
    const usagePercent = ((totalSize / (maxSizeKB * 1024)) * 100).toFixed(1);

    return {
      used: sizeKB,
      max: maxSizeKB,
      percent: usagePercent
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return null;
  }
}
