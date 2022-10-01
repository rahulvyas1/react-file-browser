import { createContext, useState, useEffect } from 'react';

// utils
import { generateRandomId } from '../utils';

// state template
const state = {
  projectTitle: 'Untitled Project',
  directoryTree: [],
  addEntity: (type, extras) => {},
  setProjectTitle: (newTitle) => {},
  newEntityData: null,
  setNewEntityData: (val) => {},
  selectedEntityId: null,
  setSelectedEntityId: (id) => {},
  setEntityName: (entityId, newName) => {},
  deleteEntity: (entityId) => {},
  activeFileId: null,
  setActiveFileId: (id) => {},
  fileIdDictionary: {},
  getDataFromEntityId: (id) => {},
  setEntityMetaData: (id, metaData) => {},
  clipboardAction: null,
  setClipboardAction: (action, data) => {},
  pasteEntity: (parentId) => {},
};

export const Context = createContext(state);

export const ContextProvider = (props) => {
  const [clipboardAction, setClipboardAction] = useState(null);
  const [newEntityData, setNewEntityData] = useState(null);
  const [fileIdDictionary, setFileIdDictionary] = useState({});
  const [activeFileId, setActiveFileId] = useState(null);
  const [selectedEntityId, setSelectedEntityId] = useState('root');
  const [projectTitle, setProjectTitle] = useState('Untitled Project');
  const [directoryTree, setDirectoryTree] = useState([]);

  useEffect(() => {
    const defaultDirTree =
      localStorage.getItem('DIR_TREE') ||
      JSON.stringify([
        {
          id: 'root',
          name: 'root',
          type: 'folder',
          metaData: {
            isExpanded: true,
          },
          items: [],
        },
      ]);
    const savedFileIdDict =
      localStorage.getItem('FILE_IDS') || JSON.stringify({});
    const savedActiveFileId = localStorage.getItem('ACTIVE_FILE_ID') || null;
    setDirectoryTree(JSON.parse(defaultDirTree));
    setFileIdDictionary(JSON.parse(savedFileIdDict));
    setActiveFileId(savedActiveFileId);
  }, []);

  useEffect(() => {
    if (Object.keys(fileIdDictionary))
      localStorage.setItem('FILE_IDS', JSON.stringify(fileIdDictionary));
  }, [fileIdDictionary]);

  useEffect(() => {
    if (directoryTree.length)
      localStorage.setItem('DIR_TREE', JSON.stringify(directoryTree));
  }, [directoryTree]);

  useEffect(() => {
    if (activeFileId) localStorage.setItem('ACTIVE_FILE_ID', activeFileId);
  }, [activeFileId]);

  /**
   * It is used for deleting the entity - file or folder
   * It uses the selected entity (instead of providing the ID to the function)
   */
  const deleteEntity = () => {
    const clonedDir = JSON.parse(JSON.stringify(directoryTree));
    const id = selectedEntityId;
    const recursive = (dir) => {
      if (dir?.length) {
        for (let i = 0; i < dir.length; i++) {
          if (dir[i].id === id) {
            console.log('deleting');
            dir.splice(i, 1);
            break;
          } else {
            recursive(dir[i].items);
          }
        }
      }
    };
    recursive(clonedDir);
    setDirectoryTree(clonedDir);
    console.log(clonedDir);
    // Delete file data from local storage
    const cloned = fileIdDictionary;
    delete cloned[selectedEntityId];
    setFileIdDictionary({ ...cloned });
  };

  /**
   * It adds the new entity - file or folder
   * @param {object} newEntity
   * @returns
   */
  const addEntity = (newEntity) => {
    // To do - pick nearest parent node if selectedEntityId is not a folder
    const parentId = selectedEntityId || 'root';
    const cloned = JSON.parse(JSON.stringify(directoryTree));
    let isError = false;
    const recursive = (dir) => {
      for (let item of dir) {
        if (parentId === item.id) {
          if (item.type === 'folder') {
            item.items.push({
              ...newEntity,
              metaData: { ...newEntity.metaData, isNew: false },
            });
          } else {
            isError = true;
          }
          break;
        } else {
          item.items && recursive(item.items);
        }
      }
    };
    recursive(cloned);

    if (isError) return false;

    setDirectoryTree(cloned);
    // Update the linear file map in localStorage
    setFileIdDictionary({ ...fileIdDictionary, selectedEntityId: true });
    if (newEntity.type === 'file') setActiveFileId(newEntity.id);
    localStorage.setItem('FILE_IDS', JSON.stringify(fileIdDictionary));
    localStorage.setItem('DIR_TREE', JSON.stringify(directoryTree));
    setNewEntityData(null);
    setSelectedEntityId(newEntity.id);
    return true;
  };

  /**
   * Used to update the name of the file or folder
   * @param {string} entityId
   * @param {string} newName
   */
  const setEntityName = (entityId, newName) => {
    const cloned = JSON.parse(JSON.stringify(directoryTree));
    const recursive = (dir) => {
      for (let item of dir) {
        if (entityId === item.id) {
          item.name = newName;
          break;
        } else {
          if (item.items) {
            recursive(item.items);
          }
        }
      }
    };
    recursive(cloned);
    setDirectoryTree(cloned);
  };

  /**
   * Updates the metaData of the entity (file or folder)
   * @param {string} entityId
   * @param {object} metaData
   */
  const setEntityMetaData = (entityId, metaData) => {
    const cloned = JSON.parse(JSON.stringify(directoryTree));
    const recursive = (dir) => {
      for (let item of dir) {
        if (entityId === item.id) {
          item.metaData = metaData;
          break;
        } else {
          if (item.items) {
            recursive(item.items);
          }
        }
      }
    };
    recursive(cloned);
    setDirectoryTree(cloned);
  };

  /**
   * Returns the data of the entity node if the entityId (string)
   * is provided.
   * @param {string} id
   * @returns
   */
  const getDataFromEntityId = (id) => {
    if (!id) return null;
    let entityObj = null;
    const recursive = (dir) => {
      for (let item of dir) {
        if (id === item.id) {
          entityObj = item;
          break;
        } else {
          item.items && recursive(item.items);
        }
      }
    };
    recursive(directoryTree);
    return entityObj;
  };

  /**
   * This function is called whenever the paste icon is clicked
   * It has logic for both CUT and COPY.
   * CUT -> removes the original node from the directory tree and moves it to the new location
   * COPY -> it copies the files from the original node by iteratively changing the ids and generating new IDs
   * It also copies the stores code data in localStorage
   * @param {*} parentId
   * @returns
   */
  const pasteEntity = (parentId) => {
    if (!clipboardAction) return;
    if (clipboardAction?.action === 'CUT') {
      // remove node from previous parent
      const clonedDir = JSON.parse(JSON.stringify(directoryTree));
      const id = clipboardAction?.files.id;
      let removedEntity;
      const recursiveCut = (dir) => {
        if (dir?.length) {
          for (let i = 0; i < dir.length; i++) {
            if (dir[i].id === id) {
              console.log('deleting');
              removedEntity = dir.splice(i, 1);
              break;
            } else {
              recursiveCut(dir[i].items);
            }
          }
        }
      };
      recursiveCut(clonedDir);
      console.log({ removedEntity });
      // If the selectedEntity is file, then find nearest parent and paste there
      const recursivePaste = (dir) => {
        for (let item of dir) {
          console.log('selectedEntityId', selectedEntityId, 'item id', item.id);
          if (parentId === item.id) {
            console.log('pasting............', item.name);
            if (item.type === 'folder') {
              item.items.push(removedEntity[0]);
            }
            break;
          } else {
            item.items && recursivePaste(item.items);
          }
        }
      };
      recursivePaste(clonedDir);
      console.log(clonedDir);
      setDirectoryTree(clonedDir);
    }
    if (clipboardAction?.action === 'COPY') {
      // move to new parent but recursively change ids of all children
      const clonedDir = JSON.parse(JSON.stringify(directoryTree));
      const id = clipboardAction?.files.id;
      let copiedEntity;
      const recursiveCopy = (dir) => {
        if (dir?.length) {
          for (let i = 0; i < dir.length; i++) {
            if (dir[i].id === id) {
              console.log('copying...');
              copiedEntity = dir[i];
              break;
            } else {
              recursiveCopy(dir[i].items);
            }
          }
        }
      };
      recursiveCopy(clonedDir);
      console.log({ copiedEntity });

      const modifiedEntity = copyFiles(copiedEntity);

      const recursivePaste = (dir) => {
        for (let item of dir) {
          console.log('selectedEntityId', selectedEntityId, 'item id', item.id);
          if (parentId === item.id) {
            console.log('pasting............', item.name);
            if (item.type === 'folder') {
              item.items.push(modifiedEntity);
            }
            break;
          } else {
            item.items && recursivePaste(item.items);
          }
        }
      };
      recursivePaste(clonedDir);
      console.log(clonedDir);
      setDirectoryTree(clonedDir);
    }
    setClipboardAction(null);
  };
  /**
   * Recursively generates new ids for entities,
   * if localStorage data exists it clone it
   * @param {object} dirToCopy
   * @returns updated directory
   */
  const copyFiles = (dirToCopy) => {
    const recursive = (dir) => {
      console.log({ dir });
      for (let item of dir) {
        const newId = generateRandomId();
        if (item.type === 'file') {
          // Clone file data
          let fileData = localStorage.getItem(item.id);
          fileData && localStorage.setItem(newId, fileData);
        }
        item.id = newId; // Generate new Ids for cloned for ease of traversal
        item.items && recursive(item.items);
      }
    };

    recursive([dirToCopy]);
    return dirToCopy;
  };

  const state = {
    projectTitle,
    directoryTree,
    addEntity,
    setProjectTitle,
    setEntityName,
    deleteEntity,
    selectedEntityId,
    setSelectedEntityId,
    activeFileId,
    setActiveFileId,
    setEntityMetaData,
    newEntityData,
    setNewEntityData,
    getDataFromEntityId,
    clipboardAction,
    setClipboardAction,
    pasteEntity,
  };

  return <Context.Provider value={state}>{props.children}</Context.Provider>;
};
