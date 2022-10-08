// context
import { useContext } from 'react';
import { Context } from './context';

// icons
import {
  DocumentPlusIcon,
  FolderPlusIcon,
  TrashIcon,
} from '@heroicons/react/20/solid';

// 3rd parties
import { toast } from 'react-toastify';

// components
import Directory from './components/Directory';
import CodeEditor from './components/CodeEditor';

// assets
import Logo from './assets/images/logo.svg';

function App() {
  const {
    projectTitle,
    directoryTree,
    getDataFromEntityId,
    deleteEntity,
    setProjectTitle,
    setNewEntityData,
    selectedEntityId,
    resetProject,
  } = useContext(Context);

  return (
    <div>
      <nav className="bg-white shadow-lg">
        <div className="mx-auto px-4">
          <div className="flex justify-between">
            <div className="flex space-x-7">
              <div>
                <a href="#" className="flex items-center py-2 px-1">
                  <span className="font-semibold text-gray-500 text-lg">
                    <img src={Logo} />
                  </span>
                </a>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-3 ">
              <a
                onClick={() => resetProject()}
                className="hover:cursor-pointer my-1 py-2 px-2 font-small text-white bg-green-700 rounded hover:bg-green-400 transition duration-300"
              >
                Create New Project
              </a>
            </div>
            <div className="md:hidden flex items-center">
              <button className="outline-none mobile-menu-button">
                <svg
                  className=" w-6 h-6 text-gray-500 hover:text-green-500 "
                  x-show="!showMenu"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div className="flex">
        <div className="flex-none w-3/12 border-r-2">
          <div className="flex justify-between bg-zinc-200 pl-4">
            <input
              className="enabled:hover:border-gray-400 disabled:opacity-100"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              disabled={true}
            />
            <div>
              <button
                className=""
                onClick={() => {
                  // Get data from entity ID and check if folder
                  const entityData = getDataFromEntityId(selectedEntityId);
                  if (entityData?.type === 'folder') {
                    setNewEntityData('file');
                  } else {
                    toast.error(
                      'Please select a folder before creating a new file.'
                    );
                  }
                }}
              >
                <DocumentPlusIcon className="h-4 w-4  text-gray-600 hover:text-gray-800" />
              </button>
              <button
                className="ml-2"
                onClick={() => {
                  // Get data from entity ID and check if folder
                  const entityData = getDataFromEntityId(selectedEntityId);
                  if (entityData?.type === 'folder') {
                    setNewEntityData('folder');
                  } else {
                    toast.error(
                      'Please select a folder before creating a new folder.'
                    );
                  }
                }}
              >
                <FolderPlusIcon className="h-4 w-4  text-gray-600 hover:text-gray-800" />
              </button>
              <button
                onClick={() => {
                  if (selectedEntityId === 'root') {
                    return toast.error('Root folder cannot be deleted.');
                  }
                  deleteEntity();
                }}
                className="ml-2"
              >
                <TrashIcon className="h-4 w-4  text-gray-600 hover:text-gray-800" />
              </button>
            </div>
          </div>
          {directoryTree &&
            directoryTree.map((files, i) => (
              <Directory files={files} key={i} />
            ))}
        </div>
        <div className="flex-initial w-9/12">
          <CodeEditor />
        </div>
      </div>
    </div>
  );
}

export default App;
