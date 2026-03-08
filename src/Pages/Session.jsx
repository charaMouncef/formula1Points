import { useState, useEffect } from 'react';

export default function Session() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedRace, setSelectedRace] = useState(null);
  const [selectedSession, setSelectedSession] = useState('Qualifying');
  const [sessionResults, setSessionResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [races, setRaces] = useState([]);
  const [teamColors, setTeamColors] = useState({});

  useEffect(() => {
    window.scrollTo({top: 0, behavior: 'smooth'});
    loadYearData(selectedYear);
  }, [selectedYear]);

  const loadYearData = async (year) => {
    setIsLoading(true);
    
    try {
      // Dynamically import the JSON file for the selected year
      const sessionData = await import(`../assets/session${year}.json`);
      
      setRaces(sessionData.races || []);
      setTeamColors(sessionData.teamColors || {});
      
      if (sessionData.races && sessionData.races.length > 0) {
        // Get unique races (group by round_number)
        const uniqueRaces = getUniqueRaces(sessionData.races);
        setSelectedRace(uniqueRaces[0]);
        
        // Load initial session results
        updateSessionResults(uniqueRaces[0], 'Qualifying', sessionData.races);
      } else {
        setSelectedRace(null);
        setSessionResults([]);
      }
    } catch (error) {
      console.error(`Error loading data for year ${year}:`, error);
      setRaces([]);
      setTeamColors({});
      setSelectedRace(null);
      setSessionResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique races (group by round_number)
  const getUniqueRaces = (racesData = races) => {
    if (!racesData || racesData.length === 0) return [];
    
    const uniqueRacesMap = new Map();
    racesData.forEach(race => {
      if (!uniqueRacesMap.has(race.round_number)) {
        uniqueRacesMap.set(race.round_number, race);
      }
    });
    return Array.from(uniqueRacesMap.values()).sort((a, b) => a.round_number - b.round_number);
  };

  // Get available sessions for a specific race
  const getAvailableSessions = (race) => {
    if (!race || !races) return [];
    return races
      .filter(r => r.round_number === race.round_number)
      .map(r => r.session_name)
      .filter((session, index, array) => array.indexOf(session) === index); // Remove duplicates
  };

  // Update session results when race or session type changes
  const updateSessionResults = (race, sessionType, racesData = races) => {
    if (!race || !racesData) return;
    
    const session = racesData.find(r => 
      r.round_number === race.round_number && 
      r.session_name === sessionType
    );
    
    if (session && session.results) {
      const sortedResults = [...session.results].sort((a, b) => 
        a.Position - b.Position
      );
      setSessionResults(sortedResults);
    } else {
      setSessionResults([]);
    }
  };

  const handleRaceSelect = (race) => {
    setSelectedRace(race);
    const availableSessions = getAvailableSessions(race);
    const newSession = availableSessions.includes(selectedSession) ? selectedSession : availableSessions[0] || 'Race';
    setSelectedSession(newSession);
    updateSessionResults(race, newSession);
  };

  const handleSessionSelect = (sessionType) => {
    setSelectedSession(sessionType);
    updateSessionResults(selectedRace, sessionType);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg font-medium">Loading {selectedYear} data...</p>
        </div>
      </div>
    );
  }

  const uniqueRaces = getUniqueRaces();
  const availableSessions = selectedRace ? getAvailableSessions(selectedRace) : [];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold italic text-center">{selectedYear} Season</h2>
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-4 py-2 rounded-lg border border-gray-300"
        >
          {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Race selector */}
      {uniqueRaces.length > 0 ? (
        <>
          <div className="mb-8 overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              {uniqueRaces.map((race) => (
                <button
                  key={race.round_number}
                  onClick={() => handleRaceSelect(race)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap cursor-pointer ${
                    selectedRace?.round_number === race.round_number
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
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
                    onClick={() => handleSessionSelect(session)}
                    className={`px-4 py-2 rounded-lg cursor-pointer ${
                      selectedSession === session
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
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
              <h3 className="text-2xl font-bold mb-2">{selectedRace.race_name}</h3>
              <div className="flex justify-center mb-4">
                <img
                  src={selectedRace.circuit_image}
                  alt={selectedRace.circuit}
                  style={{ width: '600px', height: '300px' }}
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
              <h3 className="text-2xl font-bold mb-4">{selectedSession} Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sessionResults.map((result) => (
                  <div 
                    key={`${result.DriverNumber}-${result.Position}`} 
                    className="bg-white p-4 rounded-lg shadow-md" 
                    style={{ 
                      backgroundColor: `${teamColors[result.TeamName]}30`,
                      borderLeft: `6px solid ${teamColors[result.TeamName]}`
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">
                        {typeof result.Position === 'number' 
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
                      {result.Status && result.Status !== 'Finished' && result.Status !== '' && (
                        <p className={`mt-1 ${
                          result.Status === 'Retired' || result.Status === 'Disqualified' 
                            ? 'text-red-600' 
                            : 'text-yellow-600'
                        }`}>
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
          <h3 className="text-xl font-bold text-gray-600">No data available for {selectedYear}</h3>
          <p className="text-gray-500 mt-2">Please select a different year.</p>
        </div>
      )}
    </div>
  );
}