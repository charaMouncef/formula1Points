import { useReducer, useEffect } from "react";
import {
  sessionReducer,
  initialState,
  ACTIONS,
  getUniqueRaces,
  getAvailableSessions,
} from "../reducers/sessionReducer";

export default function Session() {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

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
    loadYearData(selectedYear);
  }, [selectedYear]);

  const loadYearData = async (year) => {
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
    } catch (error) {
      console.error(`Error loading data for year ${year}:`, error);
      dispatch({ type: ACTIONS.SET_YEAR_ERROR });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg font-medium">
            Loading {selectedYear} data...
          </p>
        </div>
      </div>
    );
  }

  const uniqueRaces = getUniqueRaces(races);
  const availableSessions = selectedRace
    ? getAvailableSessions(selectedRace, races)
    : [];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold italic text-center">
          {selectedYear} Season
        </h2>
        <select
          value={selectedYear}
          onChange={(e) =>
            dispatch({
              type: ACTIONS.SET_YEAR,
              payload: Number(e.target.value),
            })
          }
          className="px-4 py-2 rounded-lg border border-gray-300"
        >
          {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map(
            (year) => (
              <option key={year} value={year}>
                {year}
              </option>
            )
          )}
        </select>
      </div>

      {uniqueRaces.length > 0 ? (
        <>
          {/* Race selector */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              {uniqueRaces.map((race) => (
                <button
                  key={race.round_number}
                  onClick={() =>
                    dispatch({ type: ACTIONS.SELECT_RACE, payload: race })
                  }
                  className={`px-4 py-2 rounded-lg whitespace-nowrap cursor-pointer ${
                    selectedRace?.round_number === race.round_number
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {race.country} GP
                </button>
              ))}
            </div>
          </div>

          {/* Session type selector */}
          {availableSessions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3">Session Type</h3>
              <div className="flex space-x-2">
                {availableSessions.map((session) => (
                  <button
                    key={session}
                    onClick={() =>
                      dispatch({
                        type: ACTIONS.SELECT_SESSION,
                        payload: session,
                      })
                    }
                    className={`px-4 py-2 rounded-lg cursor-pointer ${
                      selectedSession === session
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {session}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected race details */}
          {selectedRace && (
            <div className="mb-8 bg-white p-4 rounded-lg shadow-md">
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
            </div>
          )}

          {/* Session results */}
          {sessionResults.length > 0 && (
            <>
              <h3 className="text-2xl font-bold mb-4">
                {selectedSession} Results
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sessionResults.map((result) => (
                  <div
                    key={`${result.DriverNumber}-${result.Position}`}
                    className="bg-white p-4 rounded-lg shadow-md"
                    style={{
                      backgroundColor: `${teamColors[result.TeamName]}30`,
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
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <h3 className="text-xl font-bold text-gray-600">
            No data available for {selectedYear}
          </h3>
          <p className="text-gray-500 mt-2">Please select a different year.</p>
        </div>
      )}
    </div>
  );
}