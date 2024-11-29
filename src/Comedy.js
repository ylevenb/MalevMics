import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { OPEN_MICS_URL } from "./constants";

const OpenMicFinder = () => {
  const [mics, setMics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = [
    { label: "After Work Mics (5:30 PM or later)", value: "afterWork" },
    { label: "Late Night Mics (8:30 PM or later)", value: "lateNight" },
    { label: "Daylight Mics (before 5:30 PM)", value: "daylight" },
    { label: "Brooklyn Mics", value: "brooklyn" },
    { label: "Upper Manhattan Mics (above 14th Street)", value: "upperManhattan" },
    { label: "Lower Manhattan Mics (below 14th Street)", value: "lowerManhattan" },
  ];

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
            const reorderedMics = reorderDays(result.data);
            setMics(reorderedMics); // Set reordered mics
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

  const reorderDays = (data) => {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayIndex = new Date().getDay();

    // Rearrange days so today comes first
    const orderedDays = [...daysOfWeek.slice(todayIndex), ...daysOfWeek.slice(0, todayIndex)];

    // Sort the data based on the reordered days
    return data.sort(
      (a, b) => orderedDays.indexOf(a["Day"]) - orderedDays.indexOf(b["Day"])
    );
  };

  const applyFilters = () => {
    return mics.filter((mic) => {
      const micTime = mic["Time"] || "";
      const micBorough = mic["Borough"] || "";
      const micAddress = mic["Address"] || "";
  
      // Check if mic matches the search term
      const matchesSearch =
        searchTerm === "" ||
        (mic["Open Mic"]?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (mic["Venue Name"]?.toLowerCase() || "").includes(searchTerm.toLowerCase());
  
      // Time-related filters (OR logic)
      const matchesTimeFilters = selectedFilters.some((filter) => {
        if (filter === "afterWork") return parseTimeToHour(micTime) >= 17.5;
        if (filter === "lateNight") return parseTimeToHour(micTime) >= 20.5;
        if (filter === "daylight") return parseTimeToHour(micTime) < 17.5;
        return false;
      });
  
      // Place-related filters (OR logic)
      const matchesPlaceFilters = selectedFilters.some((filter) => {
        if (filter === "brooklyn") return micBorough.toLowerCase().includes("brooklyn");
        if (filter === "upperManhattan") return isUpperManhattan(micAddress);
        if (filter === "lowerManhattan") return isLowerManhattan(micAddress);
        return false;
      });
  
      // Combine filters across domains (AND logic)
      const requiresTimeFilter = selectedFilters.some((filter) =>
        ["afterWork", "lateNight", "daylight"].includes(filter)
      );
      const requiresPlaceFilter = selectedFilters.some((filter) =>
        ["brooklyn", "upperManhattan", "lowerManhattan"].includes(filter)
      );
  
      const matchesTime = !requiresTimeFilter || matchesTimeFilters;
      const matchesPlace = !requiresPlaceFilter || matchesPlaceFilters;
  
      return matchesSearch && matchesTime && matchesPlace;
    });
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

  const isUpperManhattan = (address) => {
    const match = address.match(/(\d+)\s/); // Extract the street number
    if (!match) return false;
    const street = parseInt(match[1], 10);
    return street > 14; // Above 14th Street
  };

  const isLowerManhattan = (address) => {
    const match = address.match(/(\d+)\s/); // Extract the street number
    if (!match) return false;
    const street = parseInt(match[1], 10);
    return street <= 14; // Below or at 14th Street
  };

  const toggleFilter = (filter) => {
    setSelectedFilters((prevFilters) =>
      prevFilters.includes(filter) ? prevFilters.filter((f) => f !== filter) : [...prevFilters, filter]
    );
  };

  const filteredMics = applyFilters();

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
        <h2 className="font-bold">Filters:</h2>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => toggleFilter(filter.value)}
              className={`p-2 rounded-md border ${
                selectedFilters.includes(filter.value) ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
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
              <p className="text-sm text-gray-600">
                Address: {mic["Address"] || "Unknown Address"}
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
