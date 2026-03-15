import { races, teamColors } from "../assets/currentSession.json";

// ─── Pure computation helpers ────────────────────────────────────────────────

function getAllDriverAbbreviations() {
  return [
    ...new Set(
      races.flatMap((race) => race.results.map((r) => r.Abbreviation))
    ),
  ];
}

function getAllConstructorTeams() {
  return [
    ...new Set(races.flatMap((race) => race.results.map((r) => r.TeamName)))
  ];
}

function buildDriverChartData(allDriverAbbreviations) {
  return races
    .map((race, raceIndex) => {
      if (race.session_name === "Qualifying") return null;

      const raceData = {
        event: `${race.circuit} ${
          race.session_name === "Sprint" ? "Sprint" : ""
        }`.trim(),
      };

      allDriverAbbreviations.forEach((abbreviation) => {
        let cumulativePoints = 0;
        for (let i = 0; i <= raceIndex; i++) {
          if (races[i].session_name === "Qualifying") continue;
          const result = races[i].results.find(
            (r) => r.Abbreviation === abbreviation
          );
          cumulativePoints += result ? result.Points || 0 : 0;
        }
        raceData[abbreviation] = cumulativePoints;
      });

      return raceData;
    })
    .filter(Boolean);
}

function buildConstructorChartData(allConstructorTeams) {
  return races
    .map((race, raceIndex) => {
      if (race.session_name === "Qualifying") return null;

      const raceData = {
        event: `${race.circuit} ${
          race.session_name === "Sprint" ? "Sprint" : ""
        }`.trim(),
      };

      allConstructorTeams.forEach((team) => {
        let cumulativePoints = 0;
        for (let i = 0; i <= raceIndex; i++) {
          if (races[i].session_name === "Qualifying") continue;
          const teamResults = races[i].results.filter(
            (r) => r.TeamName === team
          );
          cumulativePoints += teamResults.reduce(
            (sum, r) => sum + (r.Points || 0),
            0
          );
        }
        raceData[team] = cumulativePoints;
      });

      return raceData;
    })
    .filter(Boolean);
}

function buildDriverStandings(allDriverAbbreviations) {
  return allDriverAbbreviations
    .map((abbreviation) => {
      const driverResults = races
        .filter((race) => race.session_name !== "Qualifying")
        .flatMap((race) =>
          race.results.filter((r) => r.Abbreviation === abbreviation)
        );

      const totalPoints = driverResults.reduce(
        (sum, r) => sum + (r.Points || 0),
        0
      );

      const driverInfo = races
        .flatMap((race) => race.results)
        .find((r) => r.Abbreviation === abbreviation);

      const racesWithPoints = races
        .filter((race) => race.session_name !== "Qualifying")
        .map((race) => {
          const result = race.results.find(
            (r) => r.Abbreviation === abbreviation
          );
          return {
            event: `${race.circuit} ${
              race.session_name === "Sprint" ? "Sprint" : ""
            }`.trim(),
            points: result ? result.Points || 0 : 0,
            position: result ? result.Position : null,
          };
        });

      return {
        abbreviation,
        full_name: driverInfo?.FullName || abbreviation,
        team: driverInfo?.TeamName || "Unknown",
        totalPoints,
        races: racesWithPoints,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((driver, index) => ({ ...driver, position: index + 1 }));
}

function buildConstructorStandings(allConstructorTeams, constructorChartData) {
  return allConstructorTeams
    .map((team) => {
      const totalPoints =
        constructorChartData.length > 0
          ? constructorChartData[constructorChartData.length - 1][team] || 0
          : 0;

      const teamDrivers = [
        ...new Set(
          races.flatMap((race) =>
            race.results
              .filter((r) => r.TeamName === team)
              .map((r) => r.FullName)
          )
        ),
      ];

      const racesWithPoints = races
        .filter((race) => race.session_name !== "Qualifying")
        .map((race) => {
          const teamResults = race.results.filter((r) => r.TeamName === team);
          const racePoints = teamResults.reduce(
            (sum, r) => sum + (r.Points || 0),
            0
          );
          return {
            event: `${race.circuit} ${
              race.session_name === "Sprint" ? "Sprint" : ""
            }`.trim(),
            points: racePoints,
          };
        });

      return {
        name: team,
        totalPoints,
        position: 0,
        races: racesWithPoints,
        drivers: teamDrivers,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((team, index) => ({ ...team, position: index + 1 }));
}

// ─── Initial state ────────────────────────────────────────────────────────────

function computeInitialData() {
  const allDriverAbbreviations = getAllDriverAbbreviations();
  const allConstructorTeams = getAllConstructorTeams();
  const constructorChartData = buildConstructorChartData(allConstructorTeams);

  return {
    allDriverAbbreviations,
    allConstructorTeams,
    driverChartData: buildDriverChartData(allDriverAbbreviations),
    constructorChartData,
    driverStandings: buildDriverStandings(allDriverAbbreviations),
    constructorStandings: buildConstructorStandings(
      allConstructorTeams,
      constructorChartData
    ),
  };
}

export const initialState = {
  isLoading: true,
  selectDriver: null,
  selectConstructor: null,
  ...computeInitialData(),
  teamColors,
};

// ─── Action types ─────────────────────────────────────────────────────────────

export const ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SELECT_DRIVER: "SELECT_DRIVER",
  CLEAR_DRIVER: "CLEAR_DRIVER",
  SELECT_CONSTRUCTOR: "SELECT_CONSTRUCTOR",
  CLEAR_CONSTRUCTOR: "CLEAR_CONSTRUCTOR",
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function sessionReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case ACTIONS.SELECT_DRIVER:
      return { ...state, selectDriver: action.payload };

    case ACTIONS.CLEAR_DRIVER:
      return { ...state, selectDriver: null };

    case ACTIONS.SELECT_CONSTRUCTOR:
      return { ...state, selectConstructor: action.payload };

    case ACTIONS.CLEAR_CONSTRUCTOR:
      return { ...state, selectConstructor: null };

    default:
      return state;
  }
}