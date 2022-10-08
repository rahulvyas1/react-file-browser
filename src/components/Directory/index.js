import { useState, useContext, useEffect, useCallback } from 'react';
import AccordionArrow from '../../elements/AccordionArrow';
import { Context } from './../../context';
import {
  CheckIcon,
  ClipboardDocumentCheckIcon,
  DocumentDuplicateIcon,
  PencilIcon,
  ScissorsIcon,
} from '@heroicons/react/20/solid';
import { toast } from 'react-toastify';
import { extractFileExtension, generateRandomId } from '../../utils';
const Directory = ({ files }) => {
  const {
    setEntityName,
    selectedEntity,
    setSelectedEntity,
    activeFileId,
    setActiveFileId,
    newEntityData,
    addEntity,
    setNewEntityData,
    directoryTree,
    getDataFromEntityId,
    setEntityMetaData,
    clipboardAction,
    setClipboardAction,
    pasteEntity,
    nearestFolder,
  } = useContext(Context);

  const [dirData, setDirData] = useState(files?.items);
  const [name, setName] = useState(files.name);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, toggleExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    if (newEntityData && nearestFolder?.id === files.id) {
      let newEntityObj =
        newEntityData === 'folder'
          ? {
              id: generateRandomId(),
              name: 'Untitled folder',
              type: 'folder',
              metaData: {
                isExpanded: true,
                isNew: true,
              },
              items: [],
            }
          : {
              id: generateRandomId(),
              name: 'untitled file',
              type: 'file',
              extension: null,
              metaData: {
                isNew: true,
              },
            };
      setDirData([...(dirData || []), newEntityObj]);
    }
  }, [newEntityData]);

  useEffect(() => {
    const itemData = getDataFromEntityId(files.id)?.items;
    if (itemData?.length) setDirData(itemData);
  }, [directoryTree]);

  useEffect(() => {
    setIsSelected(selectedEntity?.id === files.id || activeFileId === files.id);
  }, [selectedEntity, activeFileId]);

  useEffect(() => {
    if (files.metaData?.isExpanded) {
      toggleExpanded(true);
    } else {
      toggleExpanded(false);
    }
  }, [files.metaData?.isExpanded]);

  useEffect(() => {
    if (files.id === 'root') toggleExpanded(true);
    if (files.metaData?.isNew) setIsEditing(true);
  }, []);

  if (files.type === 'folder') {
    return (
      <>
        <div className="flex w-100">
          <div className="folder hover:cursor-pointer border-l-2 ml-1 pl-2">
            <div
              className={
                isSelected
                  ? 'text-teal-600 flex hover:text-green-400'
                  : 'flex hover:text-green-400'
              }
              onMouseEnter={() => {
                setShowMenu(true);
              }}
              onMouseLeave={() => {
                setShowMenu(false);
              }}
              onClick={() => {
                toggleExpanded(!isExpanded);
                // setEntityMetaData(files.id, {
                //   ...files.metaData,
                //   isExpanded: !isExpanded,
                // });
                !isEditing && setSelectedEntity(files);
                setNewEntityData(null);
              }}
            >
              <AccordionArrow isOpen={isExpanded} />
              {!isEditing && <h2 className="folder-title">{name}</h2>}

              {isEditing && (
                <input
                  className="enabled:hover:border-gray-400 disabled:opacity-75"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              {isEditing && (
                <button
                  onClick={() => {
                    if (files.metaData?.isNew) {
                      const addRes = addEntity({
                        ...files,
                        name,
                      });
                      addRes
                        ? toast('New folder created!')
                        : toast.error(
                            'Please select a folder before creating a new folder.'
                          );
                    } else {
                      setEntityName(files.id, name);
                    }
                    setIsEditing(false);
                  }}
                  className="ml-2"
                >
                  <CheckIcon className="h-5 w-5  text-gray-600 hover:text-gray-800" />
                </button>
              )}

              {!isEditing && showMenu && (
                <button onClick={() => setIsEditing(true)} className="ml-2">
                  <PencilIcon className="h-4 w-4  text-gray-600 hover:text-gray-800" />
                </button>
              )}
              {showMenu && (
                <button
                  onClick={() => {
                    // action: CUT
                    // data: files
                    setClipboardAction({ action: 'CUT', files });
                  }}
                  className="ml-2"
                >
                  <ScissorsIcon className="h-4 w-4 text-gray-600 hover:text-gray-800" />
                </button>
              )}
              {showMenu && (
                <button
                  onClick={() => {
                    // action: CUT
                    // data: files
                    setClipboardAction({ action: 'COPY', files });
                  }}
                  className="ml-2"
                >
                  <DocumentDuplicateIcon className="h-4 w-4  text-gray-600 hover:text-gray-800" />
                </button>
              )}
              {showMenu && (
                <button
                  disabled={!clipboardAction}
                  onClick={() => {
                    // action: PASTE (whatever was copied/cut previously)
                    pasteEntity(files.id);
                  }}
                  className="ml-2"
                >
                  <ClipboardDocumentCheckIcon className="h-4 w-4 text-gray-600 hover:text-gray-800" />
                </button>
              )}
            </div>
            {isExpanded &&
              dirData.map((item) => <Directory files={item} key={item.id} />)}
          </div>

          <div></div>
        </div>
      </>
    );
  }
  return (
    <>
      <div
        className="flex"
        onMouseEnter={() => {
          setShowMenu(true);
        }}
        onMouseLeave={() => {
          setShowMenu(false);
        }}
        onClick={() => {
          !isEditing && setSelectedEntity(files);
          setActiveFileId(files.id);
          setNewEntityData(null);
        }}
      >
        <div
          className={
            isSelected
              ? ' ml-1 pl-4 text-teal-600 flex hover:text-green-400'
              : ' ml-1 pl-4 flex hover:text-green-400'
          }
        >
          {!isEditing && <h3 className="file-name">{name}</h3>}
          {isEditing && (
            <input
              className="enabled:hover:border-gray-400 disabled:opacity-75"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
        </div>
        <div>
          {isEditing && (
            <button
              onClick={() => {
                const extension = extractFileExtension(name);
                if (!extension) {
                  return toast.error(
                    'Invalid file extension. Only .txt, .json .js, and .ts are allowed.'
                  );
                }
                if (files.metaData?.isNew) {
                  const addRes = addEntity({
                    ...files,
                    name,
                    extension,
                  });
                  addRes
                    ? toast('New file created!')
                    : toast.error(
                        'Please select a folder before creating a new file.'
                      );
                } else {
                  setEntityName(files.id, name);
                }
                setIsEditing(false);
              }}
              className="ml-2"
            >
              <CheckIcon className="h-5 w-5  text-gray-600 hover:text-gray-800" />
            </button>
          )}

          {!isEditing && showMenu && (
            <button onClick={() => setIsEditing(true)} className="ml-2">
              <PencilIcon className="h-4 w-4  text-gray-600 hover:text-gray-800" />
            </button>
          )}

          {showMenu && (
            <button
              onClick={() => {
                // action: CUT
                // data: files
                setClipboardAction({ action: 'CUT', files });
              }}
              className="ml-2"
            >
              <ScissorsIcon className="h-4 w-4 text-gray-600 hover:text-gray-800" />
            </button>
          )}
          {showMenu && (
            <button
              onClick={() => {
                // action: CUT
                // data: files
                setClipboardAction({ action: 'COPY', files });
              }}
              className="ml-2"
            >
              <DocumentDuplicateIcon className="h-4 w-4  text-gray-600 hover:text-gray-800" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Directory;
