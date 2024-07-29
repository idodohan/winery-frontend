import React, { useState, useEffect, useContext, createContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaWineGlass,
  FaSearch,
  FaPlus,
  FaStar,
  FaRegStar,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaMapMarkerAlt
} from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import FilterDropdown from "./FilterDown";

const AuthContext = createContext(null);

const ISRAEL_REGIONS = [
  "Galilee",
  "Golan Heights",
  "Upper Galilee",
  "Lower Galilee",
  "Judean Hills",
  "Samson",
  "Negev",
  "Sharon",
  "Shomron",
  "Carmel",
  "Shimshon",
  "Judean Foothills",
  "Jerusalem Mountains"
];

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      const token = response.data.access_token;
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUser({ username: decodedToken.sub.username, isAdmin: decodedToken.sub.is_admin });
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (username, password, isAdmin = false) => {
    try {
      const response = await axios.post('http://localhost:5000/register', { username, password, is_admin: isAdmin });
      if (response.data.is_admin) {
        alert('Admin user created successfully. Please login.');
      } else {
        alert('User created successfully. Please login.');
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUser({ username: decodedToken.sub.username, isAdmin: decodedToken.sub.is_admin });
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-burgundy-800">Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-600"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-600"
      />
      <button type="submit" className="w-full bg-burgundy-600 text-white p-3 rounded-md hover:bg-burgundy-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-burgundy-600">
        <FaSignInAlt className="inline mr-2" /> Login
      </button>
    </form>
  );
};

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const { register } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, password, isAdmin);
      alert('Registration successful. Please login.');
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-burgundy-800">Register</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-600"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-600"
      />
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            className="mr-2"
          />
          <span className="text-gray-700">Register as Admin</span>
        </label>
      </div>
      <button type="submit" className="w-full bg-green-500 text-white p-3 rounded-md hover:bg-green-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500">
        <FaUserPlus className="inline mr-2" /> Register
      </button>
    </form>
  );
};

const WineryMarker = ({ winery, setSelectedWinery }) => {
  const map = useMap();
  const customIcon = L.divIcon({
    className: 'custom-icon',
    html: `<div class="w-8 h-8 bg-burgundy-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">${winery.name[0]}</div>`,
  });

return (
    <Marker
      position={[winery.latitude, winery.longitude]}
      icon={customIcon}
      eventHandlers={{
        click: () => {
          setSelectedWinery(winery);
          map.flyTo([winery.latitude, winery.longitude], 13);
        },
      }}
    >
      <Popup>
        <h3 className="font-bold text-lg">{winery.name}</h3>
        <p className="text-sm text-gray-600">{winery.description}</p>
        <p className="text-sm text-gray-600">Region: {winery.region}</p>
        <p className="text-sm font-semibold mt-2">Average Rating: {winery.average_rating.toFixed(1)}</p>
      </Popup>
    </Marker>
  );
};

const StarRating = ({ selectedWinery, rating, setRating, wineryId }) => {
  const { user } = useContext(AuthContext);
  const submitRating = async (newRating) => {
    try {
      const response = await axios.post(`http://localhost:5000/wineries/${selectedWinery.id}/rate`, { rating: newRating });
      setRating(response.data.average_rating);
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => submitRating(star)}
          className="text-2xl text-yellow-400 focus:outline-none"
        >
          {star <= rating ? <FaStar /> : <FaRegStar />}
        </motion.button>
      ))}
    </div>
  );
};

const LoginPage = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-burgundy-100 to-burgundy-200 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 flex items-center text-burgundy-800">
        <FaWineGlass className="mr-4 text-5xl" /> Kerem Winery Explorer
      </h1>
      <div className="w-full max-w-md">
        <LoginForm />
        <p className="text-center mt-4">
          Don't have an account? <button onClick={() => setCurrentPage('register')} className="text-burgundy-600 hover:underline">Register here</button>
        </p>
      </div>
    </div>
  );
};

const RegisterPage = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-burgundy-100 to-burgundy-200 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 flex items-center text-burgundy-800">
        <FaWineGlass className="mr-4 text-5xl" /> Kerem Winery Explorer
      </h1>
      <div className="w-full max-w-md">
        <RegisterForm />
        <p className="text-center mt-4">
          Already have an account? <button onClick={() => setCurrentPage('login')} className="text-burgundy-600 hover:underline">Login here</button>
        </p>
      </div>
    </div>
  );
};

function MainApp() {
  const [filters, setFilters] = useState({
  name: '',
  minRating: 0,
  regions: [],
});

  const [wineries, setWineries] = useState([]);
  const [newWinery, setNewWinery] = useState({ name: '', description: '', latitude: '', longitude: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWinery, setSelectedWinery] = useState(null);
  const [isAddingWinery, setIsAddingWinery] = useState(false);
  const [userRatings, setUserRatings] = useState({});
  const { user, logout } = useContext(AuthContext);
  const [mapCenter, setMapCenter] = useState([31.7683, 35.2137]);
  const [mapZoom, setMapZoom] = useState(8);

  useEffect(() => {
    if (user) {
      fetchWineries();
    }
  }, [user]);

  const fetchWineries = async () => {
    try {
      const response = await axios.get('http://localhost:5000/wineries');
      setWineries(response.data);
    } catch (error) {
      console.error("Error fetching wineries:", error);
    }
  };

  const addWinery = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/wineries', newWinery);
      setNewWinery({ name: '', description: '', latitude: '', longitude: '' });
      fetchWineries();
      setIsAddingWinery(false);
    } catch (error) {
      console.error("Error adding winery:", error);
    }
  };

const searchWineries = async () => {
  try {
    const response = await axios.get('http://localhost:5000/wineries/search', {
      params: {
        name: filters.name,
        min_rating: filters.minRating,
        regions: filters.regions.join(',')
      }
    });
    setWineries(response.data);
  } catch (error) {
    console.error("Error searching wineries:", error);
  }
};
  const setRating = (wineryId, rating) => {
    setUserRatings({ ...userRatings, [wineryId]: rating });
  };

  const handleWinerySelect = (winery) => {
    setSelectedWinery(winery);
    setMapCenter([winery.latitude, winery.longitude]);
    setMapZoom(13);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-burgundy-800 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center">
            <FaWineGlass className="mr-2" /> Kerem
          </h1>
          <div className="flex items-center">
            <span className="mr-4">Welcome, {user.username}</span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <FaSignOutAlt className="inline mr-2" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="mb-6">
          <div className="flex mb-4">
            <input
                type="text"
                placeholder="Search wineries..."
                className="flex-grow p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                value={filters.name}
                onChange={(e) => setFilters({...filters, name: e.target.value})}
            />
            <motion.button
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
                onClick={searchWineries}
                className="bg-burgundy-600 text-white p-3 rounded-r-md hover:bg-burgundy-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-burgundy-600"
            >
              <FaSearch/>
            </motion.button>
          </div>
<FilterDropdown
  filters={filters}
  setFilters={setFilters}
  ISRAEL_REGIONS={ISRAEL_REGIONS}
  user={user}
  isAddingWinery={isAddingWinery}
  setIsAddingWinery={setIsAddingWinery}
/>        </div>
        {user.isAdmin && (
            <motion.button
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
                onClick={() => setIsAddingWinery(!isAddingWinery)}
                className="mb-6 bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <FaPlus className="inline mr-2"/> {isAddingWinery ? 'Cancel' : 'Add New Winery'}
            </motion.button>
        )}

        <AnimatePresence>
          {isAddingWinery && user.isAdmin && (
              <motion.form
                  initial={{opacity: 0, height: 0}}
                  animate={{opacity: 1, height: 'auto'}}
                  exit={{opacity: 0, height: 0}}
                  onSubmit={addWinery}
                  className="mb-6 p-6 bg-white rounded-lg shadow-md overflow-hidden"
              ><h2 className="text-2xl font-bold mb-4 text-burgundy-800">Add New Winery</h2>
                <input
                    type="text"
                    placeholder="Name"
                    className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                    value={newWinery.name}
                    onChange={(e) => setNewWinery({...newWinery, name: e.target.value})}
                />
                <textarea
                    placeholder="Description"
                    className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                    value={newWinery.description}
                    onChange={(e) => setNewWinery({...newWinery, description: e.target.value})}
                />
                <input
                    type="number"
                    step="0.000001"
                    placeholder="Latitude"
                    className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                    value={newWinery.latitude}
                    onChange={(e) => setNewWinery({...newWinery, latitude: e.target.value})}
                />
                <input
                    type="number"
                    step="0.000001"
                    placeholder="Longitude"
                    className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                    value={newWinery.longitude}
                    onChange={(e) => setNewWinery({...newWinery, longitude: e.target.value})}
                />
                <motion.button
                    whileHover={{scale: 1.05}}
                    whileTap={{scale: 0.95}}
                    type="submit"
                    className="w-full bg-burgundy-600 text-white p-3 rounded-md hover:bg-burgundy-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                >
                  Add Winery
                </motion.button>
              </motion.form>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-4" style={{maxHeight: '500px', overflowY: 'auto'}}>
              <h2 className="text-2xl font-bold mb-4 text-burgundy-800">Wineries</h2>
              <ul className="space-y-2">
                {wineries.map((winery) => (
                    <li key={winery.id}>
                      <motion.button
                          whileHover={{scale: 1.02}}
                          whileTap={{scale: 0.98}}
                          onClick={() => handleWinerySelect(winery)}
                          className="w-full text-left p-3 bg-burgundy-100 rounded-md hover:bg-burgundy-200 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                      >
                        <h3 className="font-bold text-lg">{winery.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{winery.description}</p>
                        <div className="mt-2 flex items-center">
                          <StarRating
                              selectedWinery={winery}
                              rating={userRatings[winery.id] || winery.average_rating}
                              setRating={(rating) => setRating(winery.id, rating)}
                          />
                          <span className="ml-2 text-sm text-gray-600">
                          ({winery.average_rating.toFixed(1)})
                        </span>
                        </div>
                      </motion.button>
                    </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-4" style={{height: '500px'}}>
              <MapContainer center={mapCenter} zoom={mapZoom} style={{height: '100%', width: '100%'}}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                {wineries.map((winery) => (
                    <WineryMarker key={winery.id} winery={winery} setSelectedWinery={setSelectedWinery}/>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selectedWinery && (
              <motion.div
                  initial={{opacity: 0, y: 50}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, y: 50}}
                  className="mt-6 bg-white rounded-lg shadow-md p-6"
              >
                <h2 className="text-2xl font-bold mb-4 text-burgundy-800">{selectedWinery.name}</h2>
                <p className="mb-4 text-gray-700">{selectedWinery.description}</p>
                <div className="flex items-center mb-4">
                  <FaMapMarkerAlt className="text-burgundy-600 mr-2"/>
                  <p className="text-sm text-gray-600">
                    Location: {selectedWinery.latitude.toFixed(6)}, {selectedWinery.longitude.toFixed(6)}
                  </p>
                </div>
                <p className="mb-4 text-gray-700">Region: {selectedWinery.region}</p>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Rate this winery:</h3>
                  <StarRating
                      selectedWinery={selectedWinery}
                      rating={userRatings[selectedWinery.id] || selectedWinery.average_rating}
                      setRating={(rating) => setRating(selectedWinery.id, rating)}
                  />
                </div>
                <motion.button
                    whileHover={{scale: 1.05}}
                    whileTap={{scale: 0.95}}
                    onClick={() => setSelectedWinery(null)}
                    className="mt-4 bg-burgundy-600 text-white px-4 py-2 rounded-md hover:bg-burgundy-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                >
                  Close
                </motion.button>
              </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function App() {
  const {user} = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('login');

  if (!user) {
    return currentPage === 'login'
        ? <LoginPage setCurrentPage={setCurrentPage}/>
        : <RegisterPage setCurrentPage={setCurrentPage}/>;
  }

  return <MainApp/>;
}

export default function AppWithAuth() {
  return (
      <AuthProvider>
        <App/>
      </AuthProvider>
  );
}