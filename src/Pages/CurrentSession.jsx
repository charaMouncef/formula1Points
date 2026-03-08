import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { races,teamColors } from '../assets/currentSession.json';

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
  const [isLoading, setIsLoading] = useState(true);
  const [selectDriver, setSelectDriver] = useState(null);
  const [selectConstructor, setSelectConstructor] = useState(null);
  
  

  useEffect(() => {
    window.scrollTo({top: 0,behavior: 'smooth'});
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectDriver || selectConstructor) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  
    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectDriver,selectConstructor]);

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

  // Get all unique driver abbreviations
  const allDriverAbbreviations = [...new Set(
    races.flatMap(race => race.results.map(result => result.Abbreviation))
  )];

  // Get all unique constructor teams
  const allConstructorTeams = [...new Set(
    races.flatMap(race => race.results.map(result => result.TeamName))
  )];

  // Process driver data for cumulative points chart
  const driverChartData = races.map((race, raceIndex) => {
    if (race.session_name === "Qualifying") return null;
    
    const raceData = { event: `${race.circuit} ${race.session_name == "Sprint" ? "Sprint" : ""}`.trim() };
    
    // Calculate cumulative points for each driver up to current race
    allDriverAbbreviations.forEach(abbreviation => {
      let cumulativePoints = 0;
      
      for (let i = 0; i <= raceIndex; i++) {
        // Skip qualifying sessions
        if (races[i].session_name === "Qualifying") continue;
        
        const driverResult = races[i].results.find(result => 
          result.Abbreviation === abbreviation
        );
        cumulativePoints += driverResult ? (driverResult.Points || 0) : 0;
      }
      
      raceData[abbreviation] = cumulativePoints;
    });
    
    return raceData;
  }).filter(Boolean);

  // Process constructor data for cumulative points chart
  const constructorChartData = races.map((race, raceIndex) => {
    if (race.session_name === "Qualifying") return null;
    
    const raceData = { event: `${race.circuit} ${race.session_name == "Sprint" ? "Sprint" : ""}`.trim() };
    
    // Calculate cumulative points for each constructor up to current race
    allConstructorTeams.forEach(team => {
      let cumulativePoints = 0;
      
      for (let i = 0; i <= raceIndex; i++) {
        // Skip qualifying sessions
        if (races[i].session_name === "Qualifying") continue;
        
        // Sum points for all drivers in this team for this race
        const teamResults = races[i].results.filter(result => 
          result.TeamName === team
        );
        const racePoints = teamResults.reduce((sum, result) => sum + (result.Points || 0), 0);
        cumulativePoints += racePoints;
      }
      
      raceData[team] = cumulativePoints;
    });
    
    return raceData;
  }).filter(Boolean);

  // Prepare driver standings from JSON data
  const driverStandings = allDriverAbbreviations.map(abbreviation => {
    const driverResults = races
      .filter(race => race.session_name !== "Qualifying")
      .flatMap(race => race.results.filter(result => result.Abbreviation === abbreviation));
    
    const totalPoints = driverResults.reduce((sum, result) => sum + (result.Points || 0), 0);
    
    // Get driver info from first occurrence
    const driverInfo = races
      .flatMap(race => race.results)
      .find(result => result.Abbreviation === abbreviation);
    
    // Calculate individual race points (not cumulative)
    const racesWithPoints = races
      .filter(race => race.session_name !== "Qualifying")
      .map(race => {
        const result = race.results.find(r => r.Abbreviation === abbreviation);
        return {
          event: `${race.circuit} ${race.session_name == "Sprint" ? "Sprint" : ""}`.trim(),
          points: result ? (result.Points || 0) : 0,
          position: result ? result.Position : null
        };
      });

    return {
      abbreviation: abbreviation,
      full_name: driverInfo?.FullName || abbreviation,
      team: driverInfo?.TeamName || "Unknown",
      totalPoints: totalPoints,
      races: racesWithPoints
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints)
  .map((driver, index) => ({
    ...driver,
    position: index + 1
  }));

  // Prepare constructor standings - FIXED VERSION
  const constructorStandings = allConstructorTeams.map(team => {
    const totalPoints = constructorChartData.length > 0 
      ? constructorChartData[constructorChartData.length - 1][team] || 0
      : 0;
    
    // Get drivers for this team
    const teamDrivers = [...new Set(
      races.flatMap(race => 
        race.results
          .filter(result => result.TeamName === team)
          .map(result => result.FullName)
      )
    )];

    // Calculate points per race (not cumulative)
    const racesWithPoints = races
      .filter(race => race.session_name !== "Qualifying")
      .map(race => {
        const teamResults = race.results.filter(result => result.TeamName === team);
        const racePoints = teamResults.reduce((sum, result) => sum + (result.Points || 0), 0);
        
        return {
          event: `${race.circuit} ${race.session_name == "Sprint" ? "Sprint" : ""}`.trim(),
          points: racePoints, // Points gained in this specific race
        };
      });

    return {
      name: team,
      totalPoints: totalPoints,
      position: 0, // Will be set after sorting
      races: racesWithPoints, // Individual race points
      drivers: teamDrivers
    };
  })
  .sort((a, b) => b.totalPoints - a.totalPoints)
  .map((team, index) => ({
    ...team,
    position: index + 1
  }));

  return (
    <div className="p-4 ">
      <h2 className="text-4xl font-bold italic text-center my-2">Current Season {new Date().getFullYear()}</h2>
      
      {/* Driver Championship Section */}
      <div>
        <h2 className="text-2xl font-medium italic pl-4 my-2">Driver Championship Progress</h2>
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={driverChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="event" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {driverStandings.map(driver => (
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

        <h2 className="text-2xl font-medium italic pl-4 my-2">Driver Standings</h2>
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
          {driverStandings.map((driver,index) => (
            <div 
              key={driver.abbreviation} 
              className="p-4 rounded-lg shadow-md bg-white cursor-pointer hover:scale-[1.02] transition-transform"
              onClick={() => setSelectDriver(driver)}
              style={{ 
                backgroundColor: `${teamColors[driver.team]}30`, 
                borderLeft: `6px solid ${teamColors[driver.team]}` 
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base md:text-lg">#{driver.position} / {driver.full_name}</h3>
                  <p className="text-xs md:text-sm text-gray-600">{driver.team}</p>
                </div>
                <span className="font-bold text-base md:text-xl">{driver.totalPoints} pts</span>
              </div>
            </div>
          ))}

          {/* Modal Overlay */}
          {selectDriver && (
            <div className="fixed inset-0 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center p-4"
              onClick={() => setSelectDriver(null)}>
              <div 
                className="w-full max-w-md max-h-[90vh] overflow-y-hidden bg-white rounded-lg shadow-xl py-2 px-2"
                onClick={(e) => e.stopPropagation()}
                style={{ 
                  backgroundColor: `${teamColors[selectDriver.team]}30`, 
                  borderLeft: `6px solid ${teamColors[selectDriver.team]}` 
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">#{selectDriver.position} / {selectDriver.full_name}</h3>
                    <p className="text-sm md:text-base text-gray-600">{selectDriver.team}</p>
                  </div>
                  <span className="font-bold text-lg">{selectDriver.totalPoints} pts</span>
                </div>
                <hr className="my-3" />
                <div className="mt-4">
                  <p className="text-sm md:text-base font-bold">Race Results:</p>
                  <ul className="mt-1 space-y-1">
                    {selectDriver.races.map((race, idx) => (
                      <li key={`race-${idx}`} className="flex justify-between items-center text-xs md:text-sm">
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

      {/* Constructor Championship Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-medium italic pl-4 my-2">Constructor Championship Progress</h2>
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={constructorChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="event" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {constructorStandings.map(team => (
                <Line 
                  key={team.name}
                  type="monotone" 
                  dataKey={team.name} 
                  stroke={teamColors[team.name] || '#8884d8'}
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  connectNulls={true}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <h2 className="text-2xl font-medium italic pl-4 my-2">Constructor Standings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {constructorStandings.map((team, index) => (
            <div 
              key={team.name} 
              className="p-4 rounded-lg shadow-md bg-white cursor-pointer hover:scale-[1.02] transition-transform"
              onClick={() => setSelectConstructor(team)}
              style={{ 
                backgroundColor: `${teamColors[team.name]}30`,
                borderLeft: `6px solid ${teamColors[team.name]}`
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base md:text-lg">#{team.position} / {team.name}</h3>
                  <p className="text-xs md:text-sm text-gray-600">Drivers: {team.drivers.join(', ')}</p>
                </div>
                <span className="font-bold text-base md:text-xl">{team.totalPoints} pts</span>
              </div>
              
              {/* Added race results preview */}
              <div className="mt-2">
                <p className="text-sm font-bold mt-2">Recent Results:</p>
                <ul className="text-xs space-y-1 mt-1">
                  {team.races.slice(-3).map((race, idx) => (
                    <li key={`race-${idx}`} className="flex justify-between items-center py-1">
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
          <div className="fixed inset-0 bg-gray-500/50 backdrop-blur-sm z-50 flex justify-center p-2"
            onClick={() => setSelectConstructor(null)}>
            <div 
              className="w-full max-w-md max-h-[90vh] overflow-y-hidden bg-white rounded-lg shadow-xl py-2 px-6"
              onClick={(e) => e.stopPropagation()}
              style={{ 
                backgroundColor: `${teamColors[selectConstructor.name]}30`,
                borderLeft: `6px solid ${teamColors[selectConstructor.name]}`
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg ">#{selectConstructor.position} / {selectConstructor.name}</h3>
                  <p className="text-sm md:text-base text-gray-600">
                    Drivers: {selectConstructor.drivers.join(', ')}
                  </p>
                </div>
                <span className="font-bold text-lg md:text-xl">{selectConstructor.totalPoints} pts</span>
              </div>
              <hr className="my-3" />
              <div >
                <p className="text-sm md:text-base font-bold mt-1">Race Results:</p>
                <ul className="mt-1 space-y-1">
                  {selectConstructor.races.map((race, idx) => (
                    <li key={`race-${idx}`} className="flex justify-between items-center text-xs md:text-sm">
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