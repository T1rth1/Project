import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt , faBell, faSearch, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

export default function Header({ darkMode, toggleDarkMode }) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <FontAwesomeIcon icon={faShieldAlt} className='text-xl text-blue-600'/>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">AWS Security Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-3 top-3 text-gray-400 dark:text-gray-300" 
            />
          </div>
          
          <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <FontAwesomeIcon 
              icon={faBell} 
              className="text-gray-600 dark:text-gray-300" 
            />
          </button>
          
          {/* <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <FontAwesomeIcon 
              icon={darkMode ? faSun : faMoon} 
              className="text-gray-600 dark:text-gray-300" 
            />
          </button> */}
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              JP
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
