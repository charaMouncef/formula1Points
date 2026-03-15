import { useReducer, useEffect } from "react";
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

export default function CurrentSession() {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

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

  useEffect(() => {
    if (selectDriver || selectConstructor) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectDriver, selectConstructor]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 ">
      <h2 className="text-4xl font-bold italic text-center my-2">
        Current Season {new Date().getFullYear()}
      </h2>

      {/* Driver Championship Section */}
      <div>
        <h2 className="text-2xl font-medium italic pl-4 my-2">
          Driver Championship Progress
        </h2>
        <div className="bg-white p-4 rounded-lg shadow mb-8">
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
        </div>

        <h2 className="text-2xl font-medium italic pl-4 my-2">
          Driver Standings
        </h2>
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
          {driverStandings.map((driver) => (
            <div
              key={driver.abbreviation}
              className="p-4 rounded-lg shadow-md bg-white cursor-pointer hover:scale-[1.02] transition-transform"
              onClick={() =>
                dispatch({ type: ACTIONS.SELECT_DRIVER, payload: driver })
              }
              style={{
                backgroundColor: `${teamColors[driver.team]}30`,
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
            </div>
          ))}

          {/* Driver Modal */}
          {selectDriver && (
            <div
              className="fixed inset-0 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center items-center p-2"
              onClick={() => dispatch({ type: ACTIONS.CLEAR_DRIVER })}
            >
              <div
                className="w-full max-w-md max-h-[90vh] overflow-y-hidden bg-white rounded-lg shadow-xl py-2 px-6"
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: `${teamColors[selectDriver.team]}30`,
                  borderLeft: `6px solid ${teamColors[selectDriver.team]}`,
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">
                      #{selectDriver.position} / {selectDriver.full_name}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600">
                      {selectDriver.team}
                    </p>
                  </div>
                  <span className="font-bold text-lg">
                    {selectDriver.totalPoints} pts
                  </span>
                </div>
                <hr className="my-3" />
                <div className="mt-4">
                  <p className="text-sm md:text-base font-bold">
                    Race Results:
                  </p>
                  <ul className="mt-1 space-y-1">
                    {selectDriver.races.slice(1).map((race, idx) => (
                      <li
                        key={`race-${idx}`}
                        className="flex justify-between items-center text-xs md:text-sm"
                      >
                        <span className="truncate mr-4">{race.event}</span>
                        <span className="font-semibold">
                          +{race.points} pts
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Constructor Championship Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-medium italic pl-4 my-2">
          Constructor Championship Progress
        </h2>
        <div className="bg-white p-4 rounded-lg shadow mb-8">
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
        </div>

        <h2 className="text-2xl font-medium italic pl-4 my-2">
          Constructor Standings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {constructorStandings.map((team) => (
            <div
              key={team.name}
              className="p-4 rounded-lg shadow-md bg-white cursor-pointer hover:scale-[1.02] transition-transform"
              onClick={() =>
                dispatch({ type: ACTIONS.SELECT_CONSTRUCTOR, payload: team })
              }
              style={{
                backgroundColor: `${teamColors[team.name]}30`,
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

              <div className="mt-2">
                <p className="text-sm font-bold mt-2">Recent Results:</p>
                <ul className="text-xs space-y-1 mt-1">
                  {team.races.slice(-3).map((race, idx) => (
                    <li
                      key={`race-${idx}`}
                      className="flex justify-between items-center py-1"
                    >
                      <span className="truncate mr-2">{race.event}</span>
                      <span className="font-semibold">+{race.points} pts</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Constructor Modal */}
        {selectConstructor && (
          <div
            className="fixed inset-0 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center items-center p-2"
            onClick={() => dispatch({ type: ACTIONS.CLEAR_CONSTRUCTOR })}
          >
            <div
              className="w-full max-w-md max-h-[90vh] overflow-y-hidden bg-white rounded-lg shadow-xl py-2 px-6"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: `${teamColors[selectConstructor.name]}30`,
                borderLeft: `6px solid ${teamColors[selectConstructor.name]}`,
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg ">
                    #{selectConstructor.position} / {selectConstructor.name}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600">
                    Drivers: {selectConstructor.drivers.join(", ")}
                  </p>
                </div>
                <span className="font-bold text-lg md:text-xl">
                  {selectConstructor.totalPoints} pts
                </span>
              </div>
              <hr className="my-3" />
              <div>
                <p className="text-sm md:text-base font-bold mt-1">
                  Race Results:
                </p>
                <ul className="mt-1 space-y-1">
                  {selectConstructor.races.slice(1).map((race, idx) => (
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}