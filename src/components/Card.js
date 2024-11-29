import React from "react";

const Card = ({ venue, city, day, time, notes }) => (
  <div className="p-4 border rounded-md shadow-md">
    <h2 className="font-bold">{venue}</h2>
    <p>{city}</p>
    <p>
      {day} at {time}
    </p>
    <p className="text-sm text-gray-600">{notes}</p>
  </div>
);

export default Card;
