import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { OPEN_MICS_URL } from "./constants";

const OpenMicFinder = () => {
  const [mics, setMics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const timeRanges = ["Daytime", "Evening", "Nighttime", "Weekends"];
  const topPlaces = ["Manhattan", "Brooklyn", "Queens"]; // Example common places

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(OPEN_MICS_URL);
        const csvText = await response.text();

        // Parse CSV into JSON
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            console.log("Parsed Data:", result.data);
            setMics(result.data); // Set the initial data
          },
          error: (error) => {
            console.error("Error parsing CSV:", error);
          },
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filterMics = () => {
    return mics.filter((mic) => {
      const micDay = mic["Day"] || "";
      const micTime = mic["Time"] || "";
      const micPlace = mic["Borough"] || "";

      // Filter by search term
      const matchesSearch = (mic["Open Mic"]?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (mic["Venue Name"]?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        micDay.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by selected days
      const matchesDay = selectedDays.length === 0 || selectedDays.includes(micDay);

      // Filter by time ranges
      const matchesTime =
        !selectedTimes ||
        (selectedTimes === "Daytime" && isDaytime(micTime)) ||
        (selectedTimes === "Evening" && isEvening(micTime)) ||
        (selectedTimes === "Nighttime" && isNighttime(micTime)) ||
        (selectedTimes === "Weekends" && (micDay === "Saturday" || micDay === "Sunday"));

      // Filter by selected place
      const matchesPlace = !selectedPlace || micPlace === selectedPlace;

      return matchesSearch && matchesDay && matchesTime && matchesPlace;
    });
  };

  const isDaytime = (time) => {
    const hour = parseTimeToHour(time);
    return hour >= 6 && hour < 12;
  };

  const isEvening = (time) => {
    const hour = parseTimeToHour(time);
    return hour >= 12 && hour < 18;
  };

  const isNighttime = (time) => {
    const hour = parseTimeToHour(time);
    return hour >= 18 || hour < 6;
  };

  const parseTimeToHour = (time) => {
    const match = time.match(/(\d+):\d+\s*(AM|PM)/i);
    if (!match) return -1; // Invalid time format
    let [_, hour, period] = match;
    hour = parseInt(hour, 10);
    if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
    if (period.toUpperCase() === "AM" && hour === 12) hour = 0;
    return hour;
  };

  const toggleDaySelection = (day) => {
    setSelectedDays((prevDays) =>
      prevDays.includes(day) ? prevDays.filter((d) => d !== day) : [...prevDays, day]
    );
  };

  const filteredMics = filterMics();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Open Mic Finder</h1>

      {/* Search Input */}
      <div className="flex items-center mb-6">
        <input
          type="text"
          placeholder="Search by venue, city, or day"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-md w-full"
        />
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Days Filter */}
        <div>
          <h2 className="font-bold">Filter by Day:</h2>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                onClick={() => toggleDaySelection(day)}
                className={`p-2 rounded-md border ${
                  selectedDays.includes(day) ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Times Filter */}
        <div>
          <h2 className="font-bold">Filter by Time:</h2>
          <div className="flex flex-wrap gap-2">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimes(range === selectedTimes ? "" : range)}
                className={`p-2 rounded-md border ${
                  selectedTimes === range ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Places Filter */}
        <div>
          <h2 className="font-bold">Filter by Place:</h2>
          <div className="flex flex-wrap gap-2">
            {topPlaces.map((place) => (
              <button
                key={place}
                onClick={() => setSelectedPlace(place === selectedPlace ? "" : place)}
                className={`p-2 rounded-md border ${
                  selectedPlace === place ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {place}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mic Listings */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredMics.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMics.map((mic, index) => (
            <div key={index} className="p-4 border rounded-md shadow-md">
              <h2 className="font-bold">{mic["Open Mic"] || "Unknown Mic"}</h2>
              <p>{mic["Venue Name"] || "Unknown Venue"}</p>
              <p>
                {mic["Day"] || "Unknown Day"} at {mic["Time"] || "Unknown Time"}
              </p>
              <p className="text-sm text-gray-600">
                {mic["Borough"] || "Unknown Location"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No mics found.</p>
      )}
    </div>
  );
};

export default OpenMicFinder;
