// src/components/Sidebar.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faExclamationTriangle,
  faBrain,
  faRobot,
  faBell,
  faUsers,
  faCog,
} from "@fortawesome/free-solid-svg-icons";

const menuItems = [
  { name: "Dashboard", icon: faTachometerAlt, page: "/" },
  // { name: "Incident Management", icon: faExclamationTriangle, page: "incidents" },
  // { name: "User Management", icon: faUsers, page: "users" },
  { name: "Settings", icon: faCog, page: "settings" },
];

export default function Sidebar() {
  return (
    <aside className="bg-white bg-gradient-to-b from-white to to-purple-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full p-4 w-[240px]">
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.page}>
            <a
              href={`${item.page}`}
              className="flex items-center px-4 py-2 rounded-lg text-gray-700 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-800 hover:text-purple-600 dark:hover:text-purple-300"
            >
              <FontAwesomeIcon icon={item.icon} className="mr-3 w-5" />
              {item.name}
            </a>
          </li>
        ))}
      </ul>
    </aside>
    
  );
}
