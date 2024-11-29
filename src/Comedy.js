import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { OPEN_MICS_URL } from "./constants";

const OpenMicFinder = () => {
  const [mics, setMics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

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
            setMics(reorderedMics); // Reorder days before setting mics
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

  // Function to reorder the mics by day starting from the current day
  const reorderDays = (data) => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Get today's index
    const todayIndex = new Date().getDay();

    // Create a reordered array of days
    const orderedDays = [
      ...daysOfWeek.slice(todayIndex),
      ...daysOfWeek.slice(0, todayIndex),
    ];

    // Sort the data based on the reordered days
    return data.sort(
      (a, b) => orderedDays.indexOf(a["Day"]) - orderedDays.indexOf(b["Day"])
    );
  };

  const filteredMics = mics.filter((mic) =>
    (mic["Open Mic"]?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (mic["Venue Name"]?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (mic["Day"]?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Open Mic Finder</h1>
      <div className="flex items-center mb-6">
        <input
          type="text"
          placeholder="Search by venue, city, or day"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-md w-full"
        />
      </div>
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
