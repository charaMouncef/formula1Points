import {races} from "../assets/scheduleCurrentSession.json"
import { useEffect , useState } from "react";


export default function Schedule() {
    
    const [endedRaces , setEndedRaces] = useState([]);
    const [upcomingRaces , setUpcomingRaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
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
    },[])


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
    
    return(
        <div className="min-h-screen">
            <h2 className="text-4xl font-bold py-6 px-8">
                F1 Schedule {new Date().getFullYear()}
            </h2>
            <h2 className="text-2xl text-gray-600 font-bold px-8">
                Ended Races
            </h2>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Race Card */}
                {
                    endedRaces.map((race)=>{
                        return(
                            <div className="relative border-2 rounded-lg"
                            key={race.date}>
                                <div className="absolute top-[-15px] left-[-4px] text-white bg-red-600 text-xs px-4 py-2 rounded-full">
                                    Round {race.round_number}
                                </div>
                                
                                {/* Date & Flag */}
                                <div className="p-4 border-b border-gray-700">
                                    <div className="flex justify-between items-center">
                                        <p className=" font-medium text-xl">{race.date}</p>
                                        <img
                                            src={race.country_flag}
                                            alt="Flag"
                                            className="w-12 h-8 object-cover rounded-sm border"
                                        />
                                    </div>
                                </div>

                                {/* Race Info */}
                                <div className="p-4 md:max-h-[350px]  flex flex-col justify-between">
                                    <h3 className="text-2xl font-bold mb-2 ">{race.country} GRAND PRIX</h3>
                                    <p className="text-gray-800 text-sm mb-4">{race.circuit} Circuit</p>

                                    {/* Drivers Podium */}
                                    <div className="grid grid-cols-3 gap-4">
                                        {race.top_three?.map((driver) => (
                                            <div key={driver.abbreviation+" "+race.circuit} className="text-center group relative">
                                                <div 
                                                   className={`rounded-lg p-2 ${
                                                        driver.position === 1 
                                                        ? 'bg-gradient-to-br from-[rgba(255,215,0,0.2)] to-[rgba(255,215,0,0.05)] border-2 border-[#ffd700] text-[#ffd700]'
                                                        : driver.position === 2
                                                        ? 'bg-[#c0c0c0]/20  border-2 border-[#c0c0c0] text-[#c0c0c0]'
                                                        : 'bg-gradient-to-br from-[rgba(205,127,50,0.2)] to-[rgba(205,127,50,0.05)] border-2 border-[#cd7f32] text-[#cd7f32]'
                                                    }`}>
                                                    <img 
                                                        src={driver.driver_image}
                                                        alt="Driver"
                                                        className="w-full max-h-[200px] object-contain"
                                                    />
                                                    {/* Position indicator */}
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
                                                
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
            
            {
                upcomingRaces.length > 0 && (
                    <>
                        <h2 className="text-2xl text-gray-600 font-bold px-8">
                Upcoming Races
            </h2>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Race Card */}
                {
                    upcomingRaces.map((race)=>{
                        return(
                            <div className="relative border-2 rounded-lg"
                            key={race.date}>
                                <div className="absolute top-[-15px] left-[-4px] text-white bg-red-600 text-xs px-4 py-2 rounded-full">
                                    Round {race.round_number}
                                </div>
                                
                                {/* Date & Flag */}
                                <div className="p-4 border-b border-gray-700">
                                    <div className="flex justify-between items-center">
                                        <p className=" font-medium text-xl">{race.date}</p>
                                        <img
                                            src={race.country_flag}
                                            alt="Flag"
                                            className="w-12 h-8 object-cover rounded-sm border"
                                        />
                                    </div>
                                </div>

                                {/* Race Info */}
                                <div className="p-4">
                                    <h3 className="text-2xl font-bold mb-2 ">{race.country} GRAND PRIX</h3>
                                    <p className="text-gray-800 text-sm mb-4">{race.circuit} Circuit </p>

                                 
                                    <div className="">
                                        <img src={race.circuit_image} alt="" />
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
                    </>
                )
            }
        </div>
    )
}