import React, { useContext, useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';

import { Context } from './../../context';
import { DEFAULT_CONTENT } from '../../constants';

export default function CodeEditor() {
  const [code, setCode] = useState('');
  const { activeFileId, selectedEntityId, getDataFromEntityId, directoryTree } =
    useContext(Context);

  useEffect(() => {
    // Get data from local storage
    // If not available, we will create the default
    if (activeFileId) {
      const entityData = getDataFromEntityId(activeFileId);
      let fileData = localStorage.getItem(activeFileId);
      let fileExtension = 'txt';
      if (!fileData) fileExtension = entityData?.extension;
      setCode(fileData || DEFAULT_CONTENT[fileExtension]);
    }
  }, [activeFileId, directoryTree, selectedEntityId]);

  useEffect(() => {}, []);

  const onCodeChange = (val) => {
    // save the data of file in localStorage whenever it's changed
    localStorage.setItem(activeFileId, val);
  };
  return (
    <div>
      <CodeMirror
        value={code}
        height="100%"
        extensions={[javascript({ jsx: true }), json()]}
        onChange={onCodeChange}
      />
    </div>
  );
}
