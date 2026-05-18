import { useReducer, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  sessionReducer,
  initialState,
  ACTIONS,
  getUniqueRaces,
  getAvailableSessions,
} from "../reducers/sessionReducer";
import AnimatedSection from "../Components/AnimatedSection";
import { motion, AnimatePresence } from "motion/react";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const resultCardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  hover: { y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.12)", transition: { type: "spring", stiffness: 300 } },
};

export default function Session() {
  const [state, dispatch] = useReducer(sessionReducer, initialState);
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    selectedYear,
    selectedRace,
    selectedSession,
    sessionResults,
    isLoading,
    races,
    teamColors,
  } = state;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const roundParam = searchParams.get("round");
    const yearParam = searchParams.get("year");
    const year = yearParam ? Number(yearParam) : selectedYear;
    if (year !== selectedYear) {
      dispatch({ type: ACTIONS.SET_YEAR, payload: year });
    }
    loadYearData(year, roundParam ? Number(roundParam) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadYearData = async (year, preSelectedRound = null) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const sessionData = await import(`../assets/session${year}.json`);
      dispatch({
        type: ACTIONS.SET_YEAR_DATA,
        payload: {
          races: sessionData.races || [],
          teamColors: sessionData.teamColors || {},
        },
      });
      if (preSelectedRound) {
        const allRaces = getUniqueRaces(sessionData.races || []);
        const race = allRaces.find(r => r.round_number === preSelectedRound);
        if (race) {
          dispatch({ type: ACTIONS.SELECT_RACE, payload: race });
          dispatch({ type: ACTIONS.SELECT_SESSION, payload: "Race" });
        }
      }
    } catch (error) {
      console.error(`Error loading data for year ${year}:`, error);
      dispatch({ type: ACTIONS.SET_YEAR_ERROR });
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
          <p className="mt-4 text-lg font-medium">
            Loading {selectedYear} data...
          </p>
        </motion.div>
      </div>
    );
  }

  const uniqueRaces = getUniqueRaces(races);
  const availableSessions = selectedRace
    ? getAvailableSessions(selectedRace, races)
    : [];

  return (
    <div className="p-4">
      <AnimatedSection>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold italic text-center">
            {selectedYear} Season
          </h2>
          <motion.select
            value={selectedYear}
            onChange={(e) => {
              const year = Number(e.target.value);
              setSearchParams({ year: String(year) });
              dispatch({ type: ACTIONS.SET_YEAR, payload: year });
              loadYearData(year);
            }}
            whileFocus={{ scale: 1.02 }}
            className="px-4 py-2 rounded-lg border border-gray-300 cursor-pointer"
          >
            {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map(
              (year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            )}
          </motion.select>
        </div>
      </AnimatedSection>

      {uniqueRaces.length > 0 ? (
        <>
          <AnimatedSection>
            <div className="mb-8 overflow-x-auto">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex space-x-2 pb-2"
              >
                {uniqueRaces.map((race) => (
                  <motion.button
                    key={race.round_number}
                    variants={resultCardVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      dispatch({ type: ACTIONS.SELECT_RACE, payload: race });
                      setSearchParams({ year: String(selectedYear), round: String(race.round_number) });
                    }}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap cursor-pointer transition-colors duration-300 ${
                      selectedRace?.round_number === race.round_number
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {race.country} GP
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </AnimatedSection>

          <AnimatePresence mode="wait">
            {availableSessions.length > 0 && (
              <motion.div
                key={selectedRace?.round_number}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatedSection>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-3">Session Type</h3>
                    <div className="flex space-x-2">
                      {availableSessions.map((session) => (
                        <motion.button
                          key={session}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            dispatch({
                              type: ACTIONS.SELECT_SESSION,
                              payload: session,
                            })
                          }
                          className={`px-4 py-2 rounded-lg cursor-pointer transition-colors duration-300 ${
                            selectedSession === session
                              ? "bg-red-600 text-white"
                              : "bg-gray-200 hover:bg-gray-300"
                          }`}
                        >
                          {session}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              </motion.div>
            )}
          </AnimatePresence>

          {selectedRace && (
            <AnimatedSection>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-8 bg-white p-4 rounded-lg shadow-md"
              >
                <h3 className="text-2xl font-bold mb-2">
                  {selectedRace.race_name}
                </h3>
                <div className="flex justify-center mb-4">
                  <img
                    src={selectedRace.circuit_image}
                    alt={selectedRace.circuit}
                    style={{ width: "600px", height: "300px" }}
                    className="object-contain rounded"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-600">Circuit</p>
                    <p className="font-medium">{selectedRace.circuit}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Location</p>
                    <div className="flex items-center gap-2">
                      <img
                        src={selectedRace.country_flag}
                        alt="Country Flag"
                        className="w-8 h-auto"
                      />
                      <p className="font-medium">{selectedRace.country}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-medium">{selectedRace.date}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>
          )}

          <AnimatePresence mode="wait">
            {sessionResults.length > 0 && (
              <motion.div
                key={`${selectedRace?.round_number}-${selectedSession}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatedSection>
                  <>
                    <h3 className="text-2xl font-bold mb-4">
                      {selectedSession} Results
                    </h3>
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                      {sessionResults.map((result) => (
                        <motion.div
                          key={`${result.DriverNumber}-${result.Position}`}
                          variants={resultCardVariants}
                          whileHover="hover"
                          className="bg-white p-4 rounded-lg shadow-md"
                          style={{
                            backgroundColor: `${teamColors[result.TeamName]}20`,
                            borderLeft: `6px solid ${teamColors[result.TeamName]}`,
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-lg">
                              {typeof result.Position === "number"
                                ? `P${result.Position}`
                                : result.Position}
                            </span>
                            {result.Points > 0 && (
                              <span className="bg-green-500 text-white px-2 py-1 rounded-xl text-sm">
                                +{result.Points} pts
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-xl">{result.FullName}</h3>
                          <p
                            className="text-gray-600"
                            style={{ color: teamColors[result.TeamName] }}
                          >
                            {result.TeamName}
                          </p>
                          <div className="mt-2 text-sm">
                            <p>Driver Number: {result.DriverNumber}</p>
                            <p>Driver Code: {result.Abbreviation}</p>
                            {result.Status &&
                              result.Status !== "Finished" &&
                              result.Status !== "" && (
                                <p
                                  className={`mt-1 ${
                                    result.Status === "Retired" ||
                                    result.Status === "Disqualified"
                                      ? "text-red-600"
                                      : "text-yellow-600"
                                  }`}
                                >
                                  Status: {result.Status}
                                </p>
                              )}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </>
                </AnimatedSection>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <AnimatedSection>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <h3 className="text-xl font-bold text-gray-600">
              No data available for {selectedYear}
            </h3>
            <p className="text-gray-500 mt-2">Please select a different year.</p>
          </motion.div>
        </AnimatedSection>
      )}
    </div>
  );
}
