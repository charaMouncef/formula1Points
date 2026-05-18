import { useReducer, useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { sessionReducer, initialState, ACTIONS } from "../reducers/currentSessionReducer";
import AnimatedSection from "../Components/AnimatedSection";
import { motion, AnimatePresence } from "motion/react";

const CustomTooltip = ({ payload, label }) => {
  return (
    <div className="bg-white p-4 border border-gray-200 rounded shadow-lg">
      <p className="font-bold">{label}</p>
      <ul>
        {payload
          .sort((a, b) => b.value - a.value)
          .map((entry, index) => (
            <li key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value} pts
            </li>
          ))}
      </ul>
    </div>
  );
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  hover: { y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.12)", transition: { type: "spring", stiffness: 300 } },
  tap: { scale: 0.98 },
};

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } },
};

export default function CurrentSession() {
  const [state, dispatch] = useReducer(sessionReducer, initialState);
  const [expandedDriver, setExpandedDriver] = useState(null);
  const [expandedConstructor, setExpandedConstructor] = useState(null);

  const {
    isLoading,
    selectDriver,
    selectConstructor,
    driverChartData,
    constructorChartData,
    driverStandings,
    constructorStandings,
    teamColors,
  } = state;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const timer = setTimeout(() => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const closeModals = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_DRIVER });
    dispatch({ type: ACTIONS.CLEAR_CONSTRUCTOR });
    setExpandedDriver(null);
    setExpandedConstructor(null);
  }, []);

  useEffect(() => {
    if (selectDriver || selectConstructor) {
      document.body.style.overflow = "hidden";
      window.history.pushState({ modal: true }, "");
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectDriver, selectConstructor]);

  useEffect(() => {
    const handlePopState = () => {
      if (selectDriver || selectConstructor) {
        closeModals();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [selectDriver, selectConstructor, closeModals]);

  const handleDriverClick = (driver) => {
    if (expandedDriver?.abbreviation === driver.abbreviation) {
      dispatch({ type: ACTIONS.SELECT_DRIVER, payload: driver });
    } else {
      setExpandedDriver(driver);
      setExpandedConstructor(null);
    }
  };

  const handleConstructorClick = (team) => {
    if (expandedConstructor?.name === team.name) {
      dispatch({ type: ACTIONS.SELECT_CONSTRUCTOR, payload: team });
    } else {
      setExpandedConstructor(team);
      setExpandedDriver(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"
          />
          <p className="mt-4 text-lg font-medium">Loading data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <AnimatedSection>
        <h2 className="text-4xl font-bold italic text-center my-2">
          Current Season {new Date().getFullYear()}
        </h2>
      </AnimatedSection>

      {/* Driver Championship Section */}
      <div>
        <AnimatedSection>
          <h2 className="text-2xl font-medium italic pl-4 my-2">
            Driver Championship Progress
          </h2>
        </AnimatedSection>
        <AnimatedSection>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white p-4 rounded-lg shadow mb-8"
          >
            <ResponsiveContainer width="100%" height={500}>
              <LineChart
                data={driverChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="event" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {driverStandings.map((driver) => (
                  <Line
                    key={driver.abbreviation}
                    type="monotone"
                    dataKey={driver.abbreviation}
                    stroke={teamColors[driver.team]}
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                    connectNulls={true}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatedSection>

        <AnimatedSection>
          <h2 className="text-2xl font-medium italic pl-4 my-2">
            Driver Standings
          </h2>
        </AnimatedSection>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="columns-1 md:columns-2 lg:columns-4 xl:columns-5 gap-6 p-4"
        >
          {driverStandings.map((driver) => (
            <motion.div
              key={driver.abbreviation}
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              className="break-inside-avoid p-4 rounded-lg shadow-md bg-white cursor-pointer mb-4"
              onClick={() => handleDriverClick(driver)}
              style={{
                backgroundColor: `${teamColors[driver.team]}15`,
                borderLeft: `6px solid ${teamColors[driver.team]}`,
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base md:text-lg">
                    #{driver.position} / {driver.full_name}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {driver.team}
                  </p>
                </div>
                <span className="font-bold text-base md:text-xl">
                  {driver.totalPoints} pts
                </span>
              </div>

              <AnimatePresence>
                {expandedDriver?.abbreviation === driver.abbreviation && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 border-t pt-3 border-gray-300 overflow-hidden"
                  >
                    <p className="text-sm font-bold">Last 3 Race Results:</p>
                    <ul className="text-xs space-y-1 mt-1">
                      {driver.races.slice(-3).map((race, idx) => (
                        <li key={idx} className="flex justify-between items-center py-1">
                          <span className="truncate mr-2">{race.event}</span>
                          <span className="font-semibold">+{race.points} pts</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-400 mt-2">Click again for all results</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Driver Modal */}
        <AnimatePresence>
          {selectDriver && (
            <motion.div
              key="driver-modal"
              variants={modalOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center items-center p-2"
              onClick={() => {
                dispatch({ type: ACTIONS.CLEAR_DRIVER });
                setExpandedDriver(null);
              }}
            >
              <motion.div
                variants={modalContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl py-2 px-6"
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: `${teamColors[selectDriver.team]}20`,
                  borderLeft: `6px solid ${teamColors[selectDriver.team]}`,
                }}
              >
                <div className="flex justify-between items-center sticky top-0 py-2">
                  <div>
                    <h3 className="font-bold text-lg">
                      #{selectDriver.position} / {selectDriver.full_name}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600">
                      {selectDriver.team}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">
                      {selectDriver.totalPoints} pts
                    </span>
                    <button
                      onClick={closeModals}
                      className="cursor-pointer text-gray-500 hover:text-black transition-colors"
                      aria-label="Close modal"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                <hr className="my-3" />
                <div className="mt-4">
                  <p className="text-sm md:text-base font-bold">
                    All Race Results:
                  </p>
                  <ul className="mt-1 space-y-1">
                    {selectDriver.races.slice(1).map((race, idx) => (
                      <li
                        key={`race-${idx}`}
                        className="flex justify-between items-center text-xs md:text-sm"
                      >
                        <span className="truncate mr-4">{race.event}</span>
                        <span className="font-semibold">+{race.points} pts</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Constructor Championship Section */}
      <div className="mt-12">
        <AnimatedSection>
          <h2 className="text-2xl font-medium italic pl-4 my-2">
            Constructor Championship Progress
          </h2>
        </AnimatedSection>
        <AnimatedSection>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white p-4 rounded-lg shadow mb-8"
          >
            <ResponsiveContainer width="100%" height={500}>
              <LineChart
                data={constructorChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="event" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {constructorStandings.map((team) => (
                  <Line
                    key={team.name}
                    type="monotone"
                    dataKey={team.name}
                    stroke={teamColors[team.name] || "#8884d8"}
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                    connectNulls={true}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatedSection>

        <AnimatedSection>
          <h2 className="text-2xl font-medium italic pl-4 my-2">
            Constructor Standings
          </h2>
        </AnimatedSection>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="columns-1 md:columns-2 lg:columns-3 gap-6 p-4"
        >
          {constructorStandings.map((team) => (
            <motion.div
              key={team.name}
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              className="break-inside-avoid p-4 rounded-lg shadow-md bg-white cursor-pointer mb-4"
              onClick={() => handleConstructorClick(team)}
              style={{
                backgroundColor: `${teamColors[team.name]}15`,
                borderLeft: `6px solid ${teamColors[team.name]}`,
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base md:text-lg">
                    #{team.position} / {team.name}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    Drivers: {team.drivers.join(", ")}
                  </p>
                </div>
                <span className="font-bold text-base md:text-xl">
                  {team.totalPoints} pts
                </span>
              </div>

              <AnimatePresence>
                {expandedConstructor?.name === team.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 border-t pt-3 border-gray-300 overflow-hidden"
                  >
                    <p className="text-sm font-bold">Last 3 Race Results:</p>
                    <ul className="text-xs space-y-1 mt-1">
                      {team.races.slice(-3).map((race, idx) => (
                        <li key={idx} className="flex justify-between items-center py-1">
                          <span className="truncate mr-2">{race.event}</span>
                          <span className="font-semibold">+{race.points} pts</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-400 mt-2">Click again for all results</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Constructor Modal */}
        <AnimatePresence>
          {selectConstructor && (
            <motion.div
              key="constructor-modal"
              variants={modalOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center items-center p-2"
              onClick={() => {
                dispatch({ type: ACTIONS.CLEAR_CONSTRUCTOR });
                setExpandedConstructor(null);
              }}
            >
              <motion.div
                variants={modalContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl py-2 px-6"
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: `${teamColors[selectConstructor.name]}20`,
                  borderLeft: `6px solid ${teamColors[selectConstructor.name]}`,
                }}
              >
                <div className="flex justify-between items-center sticky top-0 py-2">
                  <div>
                    <h3 className="font-bold text-lg">
                      #{selectConstructor.position} / {selectConstructor.name}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600">
                      Drivers: {selectConstructor.drivers.join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg md:text-xl">
                      {selectConstructor.totalPoints} pts
                    </span>
                    <button
                      onClick={closeModals}
                      className="cursor-pointer text-gray-500 hover:text-black transition-colors"
                      aria-label="Close modal"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                <hr className="my-3" />
                <div>
                  <p className="text-sm md:text-base font-bold mt-1">
                    All Race Results:
                  </p>
                  <ul className="mt-1 space-y-1">
                    {selectConstructor.races.map((race, idx) => (
                      <li
                        key={`race-${idx}`}
                        className="flex justify-between items-center text-xs md:text-sm"
                      >
                        <span className="truncate mr-4">{race.event}</span>
                        <span className="font-semibold">+{race.points} pts</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
