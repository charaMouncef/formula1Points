import {races} from "../assets/scheduleCurrentSession.json"
import { useEffect , useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedSection from "../Components/AnimatedSection";
import { motion } from "motion/react";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const raceCardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  hover: { y: -6, boxShadow: "0 16px 32px rgba(0,0,0,0.1)", transition: { type: "spring", stiffness: 300 } },
};

const podiumVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: 0.1 * i, duration: 0.4, ease: "easeOut" },
  }),
};

export default function Schedule() {
    const navigate = useNavigate();

    const [endedRaces , setEndedRaces] = useState([]);
    const [upcomingRaces , setUpcomingRaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(()=>{
        window.scrollTo({top: 0,behavior: 'smooth'});
        const ended = races.filter((race) =>{
            return race.is_completed;
        })
        const upcoming = races.filter((race) =>{
           return !race.is_completed;
        })
        setEndedRaces(ended);
        setUpcomingRaces(upcoming);

        setTimeout(() => {
            setIsLoading(false);
          }, 1000);
    },[]);

    const nextRace = useMemo(() => {
      if (upcomingRaces.length === 0) return null;
      return upcomingRaces.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      )[0];
    }, [upcomingRaces]);

    useEffect(() => {
      if (!nextRace) return;

      const now = new Date();
      const raceDate = new Date(nextRace.date);
      const diff = raceDate - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      const totalHours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(totalHours / 24);
      const hours = totalHours % 24;

      if (days < 1) {
        setTimeLeft({ hours: totalHours });
      } else {
        setTimeLeft({ days, hours });
      }
    }, [nextRace]);


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

    return(
        <div className="min-h-screen">
            <AnimatedSection>
                <h2 className="text-4xl font-bold py-6 px-8">
                    F1 Schedule {new Date().getFullYear()}
                </h2>
            </AnimatedSection>

            <AnimatedSection>
                <h2 className="text-2xl text-gray-600 font-bold px-8">
                    Ended Races
                </h2>
            </AnimatedSection>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {
                    endedRaces.map((race)=>{
                        const year = race.date.slice(0, 4);
                        return(
                            <motion.div
                              key={race.date}
                              variants={raceCardVariants}
                              whileHover="hover"
                              onClick={() => navigate(`/sessions?round=${race.round_number}&year=${year}`)}
                              className="cursor-pointer"
                            >
                                <div className="relative border-2 rounded-lg">
                                    <div className="absolute top-[-15px] left-[-4px] text-white bg-red-600 text-xs px-4 py-2 rounded-full z-10">
                                        Round {race.round_number}
                                    </div>

                                    <div className="p-4 border-b border-gray-700">
                                        <div className="flex justify-between items-center">
                                            <p className="font-medium text-xl">{race.date}</p>
                                            <img
                                                src={race.country_flag}
                                                alt="Flag"
                                                className="w-12 h-8 object-cover rounded-sm border"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 md:max-h-[350px] flex flex-col justify-between">
                                        <h3 className="text-2xl font-bold mb-2">{race.country} GRAND PRIX</h3>
                                        <p className="text-gray-800 text-sm mb-4">{race.circuit} Circuit</p>

                                        <div className="grid grid-cols-3 gap-4">
                                            {race.top_three?.map((driver, i) => (
                                                <motion.div
                                                  key={driver.abbreviation+" "+race.circuit}
                                                  custom={i}
                                                  variants={podiumVariants}
                                                  className="text-center group relative"
                                                >
                                                    <div
                                                       className={`rounded-lg p-2 ${
                                                            driver.position === 1
                                                            ? 'bg-gradient-to-br from-[rgba(255,215,0,0.2)] to-[rgba(255,215,0,0.05)] border-2 border-[#ffd700] text-[#ffd700]'
                                                            : driver.position === 2
                                                            ? 'bg-[#c0c0c0]/20 border-2 border-[#c0c0c0] text-[#c0c0c0]'
                                                            : 'bg-gradient-to-br from-[rgba(205,127,50,0.2)] to-[rgba(205,127,50,0.05)] border-2 border-[#cd7f32] text-[#cd7f32]'
                                                        }`}>
                                                        <img
                                                            src={driver.driver_image}
                                                            alt="Driver"
                                                            className="w-full max-h-[200px] object-contain"
                                                        />
                                                        <div className={`absolute -top-3 -left-2 w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center font-bold z-10 shadow-lg text-white text-sm md:text-base lg:text-lg
                                                            ${
                                                            driver.position === 1
                                                            ? 'bg-[#ffd700] '
                                                            : driver.position === 2
                                                            ? 'bg-[#c0c0c0] '
                                                            : 'bg-[#cd7f32] '
                                                        }`}>
                                                            {driver.position}
                                                        </div>
                                                        <div className="flex items-center justify-center mt-2">
                                                            <h2 className="font-bold">{driver.driver_name.split(" ")[1]}</h2>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })
                }
            </motion.div>

            {/* Next Race Block - Moved between Ended and Upcoming races */}
            {nextRace && timeLeft && (
              <AnimatedSection>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mx-8 mb-8 bg-gray-900 text-white rounded-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6"
                >
                  <div className="md:flex-1">
                    <p className="text-red-400 font-semibold text-sm uppercase tracking-wider">Next Race</p>
                    <h3 className="text-3xl md:text-4xl font-bold mt-1">{nextRace.country} GRAND PRIX</h3>
                    <p className="text-gray-400 mt-1">{nextRace.circuit} Circuit</p>
                    <p className="text-gray-500 text-sm mt-1">{nextRace.date}</p>
                    <div className="flex items-center gap-4 md:gap-6 mt-4">
                      {timeLeft.days !== undefined ? (
                        <div className="text-center">
                          <div className="text-4xl md:text-5xl font-bold text-red-400">{String(timeLeft.days).padStart(2, "0")}</div>
                          <div className="text-xs md:text-sm text-gray-400 uppercase">Days</div>
                        </div>
                      ) : null}
                      <span className="text-3xl md:text-4xl font-bold text-gray-600 mt-[-8px]">:</span>
                      <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-red-400">{String(timeLeft.hours).padStart(2, "0")}</div>
                        <div className="text-xs md:text-sm text-gray-400 uppercase">Hours</div>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-80 shrink-0">
                    <motion.img 
                      src={nextRace.circuit_image} 
                      alt={`${nextRace.circuit} Circuit`}
                      className="w-full h-36 md:h-44 object-contain rounded-lg"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    />
                  </div>
                </motion.div>
              </AnimatedSection>
            )}

            {(() => {
                const remainingUpcoming = upcomingRaces.filter(race => race.round_number !== nextRace?.round_number);
                return remainingUpcoming.length > 0 ? (
                    <>
                        <AnimatedSection>
                            <h2 className="text-2xl text-gray-600 font-bold px-8">
                Upcoming Races
            </h2>
                        </AnimatedSection>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {
                    remainingUpcoming.map((race)=>{
                        return(
                            <motion.div
                              key={race.date}
                              variants={raceCardVariants}
                              whileHover="hover"
                            >
                                <div className="relative border-2 rounded-lg">
                                    <div className="absolute top-[-15px] left-[-4px] text-white bg-red-600 text-xs px-4 py-2 rounded-full z-10">
                                        Round {race.round_number}
                                    </div>

                                    <div className="p-4 border-b border-gray-700">
                                        <div className="flex justify-between items-center">
                                            <p className="font-medium text-xl">{race.date}</p>
                                            <img
                                                src={race.country_flag}
                                                alt="Flag"
                                                className="w-12 h-8 object-cover rounded-sm border"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="text-2xl font-bold mb-2">{race.country} GRAND PRIX</h3>
                                        <p className="text-gray-800 text-sm mb-4">{race.circuit} Circuit</p>

                                        <motion.div
                                          initial={{ opacity: 0, scale: 0.9 }}
                                          whileInView={{ opacity: 1, scale: 1 }}
                                          viewport={{ once: true }}
                                          transition={{ duration: 0.5 }}
                                        >
                                            <img src={race.circuit_image} alt="" />
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })
                }
            </motion.div>
                    </>
                ) : null;
            })()}
        </div>
    )
}