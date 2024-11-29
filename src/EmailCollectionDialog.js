import React, { useState } from "react";
import { FORM_SUBMISSION_URL } from "./constants";

const EmailCollectionDialog = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    yearsInComedy: "",
    micsPerWeek: "",
    expenses: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(formData).some((field) => !field)) {
      setError("All fields are required.");
      return;
    }

    setError("");
    try {
      const response = await fetch(FORM_SUBMISSION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        throw new Error("Submission failed.");
      }
    } catch (error) {
      setError("Error submitting form. Try again later.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
        <h2 className="text-xl font-bold mb-4">Join the Beta</h2>
        {success ? (
          <p className="text-green-600">Thanks for joining!</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="mb-2 p-2 border rounded-md w-full"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="mb-2 p-2 border rounded-md w-full"
            />
            {/* Add other fields similarly */}
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-md">
              Submit
            </button>
          </form>
        )}
        {error && <p className="text-red-600">{error}</p>}
        <button onClick={onClose} className="mt-4 text-gray-500 underline">
          Close
        </button>
      </div>
    </div>
  );
};

export default EmailCollectionDialog;
